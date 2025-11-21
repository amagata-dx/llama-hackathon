// Llama API クライアント
// メインアプリのapi.tsと同じパターンで実装

interface LlamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LlamaResponse {
  choices: Array<{
    finish_reason?: string
    index: number
    message?: {
      content: string
      role: string
    }
  }>
  created?: number
  id?: string
  model?: string
  object?: string
}

// 構造化されたタグ分析レスポンス
export interface TagAnalysisResponse {
  tags: Array<{
    label: string
    category: 'behavioral' | 'academic' | 'health' | 'family' | 'social' | 'emergency'
  }>
  priority: 'urgent' | 'high' | 'normal' | 'low'
  type: 'behavioral' | 'academic' | 'health' | 'family' | 'social' | 'emergency'
  location?: string
  sentiment: number
  keywords: string[]
  suggestedActions: string[]
  confidence: number
  // テキスト改善フィールド
  restructuredText?: string  // 整形されたテキスト
  summary?: string           // 要約
}

// Llama APIを呼び出して、構造化されたレスポンスを取得
export async function callLlamaAPI(messages: LlamaMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_LLAMA_API_KEY

  if (!apiKey) {
    throw new Error('VITE_LLAMA_API_KEY が設定されていません。.envファイルを確認してください。')
  }

  try {
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        stream: false,
        model: 'Llama-4-Maverick-17B-128E-Instruct',
        messages: messages,
        temperature: 0.3, // より一貫性のある出力のため低めに設定
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API request failed: ${response.status} - ${error}`)
    }

    const data = await response.json() as LlamaResponse
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('レスポンスにコンテンツが含まれていません')
    }

    return content
  } catch (error) {
    console.error('Llama API エラー:', error)
    throw error
  }
}

// 構造化されたJSONレスポンスを取得
export async function getStructuredResponse(messages: LlamaMessage[]): Promise<TagAnalysisResponse | null> {
  try {
    const content = await callLlamaAPI(messages)

    // JSONの抽出を試みる（マークダウンコードブロックなども考慮）
    let jsonStr = content

    // ```json ... ``` のパターンを検出
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1]
    }

    // { } で囲まれた部分を抽出
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    // JSONをパース
    const parsed = JSON.parse(jsonStr) as TagAnalysisResponse

    // 必須フィールドの検証
    if (!parsed.tags || !Array.isArray(parsed.tags)) {
      console.warn('タグが見つかりません')
      return null
    }

    return parsed
  } catch (error) {
    console.error('構造化レスポンスのパースエラー:', error)
    return null
  }
}

// 観察記録分析用のプロンプトを生成
export function createAnalysisPrompt(
  observationText: string,
  studentNames?: string[],
  location?: string,
  includeTextImprovement: boolean = false
): LlamaMessage[] {
  const systemPrompt = `あなたは教員の観察記録を分析する専門的なAIアシスタントです。
観察記録の内容を分析し、適切なタグ付けと分類を行ってください。
${includeTextImprovement ? 'また、音声入力されたテキストを整形し、要約も生成してください。' : ''}
必ずJSON形式のみで応答してください。他の説明は不要です。

カテゴリの定義:
- behavioral: 行動に関する観察（いじめ、孤立、反抗的態度など）
- academic: 学習に関する観察（成績、宿題、授業参加など）
- health: 健康に関する観察（体調不良、精神的不調、けがなど）
- family: 家庭に関する観察（家庭環境の変化、保護者関連など）
- social: 社会性に関する観察（友人関係、グループダイナミクスなど）
- emergency: 緊急対応が必要な観察

優先度の基準:
- urgent: 即座の対応が必要（いじめ、暴力、自傷行為など）
- high: 早急な対応が望ましい
- normal: 通常の観察記録
- low: 経過観察で良い

${includeTextImprovement ? `テキスト整形の基準:
- 句読点を適切に追加
- 文法的な誤りを修正
- 論理的な流れに再構成
- 冗長な表現を簡潔に
- 専門用語を統一

要約の基準:
- WHO（誰が）、WHAT（何を）、WHEN（いつ）、WHERE（どこで）を明確に
- 重要な懸念事項を含める
- 3文以内で簡潔にまとめる` : ''}`

  const userPrompt = `以下の観察記録を分析してください。

観察内容: "${observationText}"
${studentNames && studentNames.length > 0 ? `対象生徒: ${studentNames.join(', ')}` : ''}
${location ? `場所: ${location}` : ''}

以下の形式のJSONのみで応答してください:
{
  "tags": [
    { "label": "タグ名", "category": "behavioral|academic|health|family|social|emergency" }
  ],
  "priority": "urgent|high|normal|low",
  "type": "behavioral|academic|health|family|social|emergency",
  "location": "場所（教室、廊下、体育館など）",
  "sentiment": 感情スコア（-1.0から1.0の数値、負は否定的、正は肯定的）,
  "keywords": ["重要なキーワード1", "キーワード2"],
  "suggestedActions": ["推奨される対応1", "対応2"],
  "confidence": 分析の確信度（0.0から1.0の数値）${includeTextImprovement ? `,
  "restructuredText": "整形されたテキスト（句読点追加、文法修正、論理的な流れ）",
  "summary": "要約（3文以内、重要なポイントのみ）"` : ''}
}`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]
}