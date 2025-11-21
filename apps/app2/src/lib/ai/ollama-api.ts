// Ollama API クライアント
// ローカルのOllamaサーバーと通信してLLM分析を実行

interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream?: boolean
  format?: string
}

interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

// Ollama APIのエンドポイント設定
const getOllamaConfig = () => ({
  url: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2',
  enabled: import.meta.env.VITE_OLLAMA_ENABLED !== 'false' // デフォルトで有効
})

// Ollamaが利用可能かチェック
export async function checkOllamaAvailability(): Promise<boolean> {
  const config = getOllamaConfig()

  if (!config.enabled) {
    return false
  }

  try {
    const response = await fetch(`${config.url}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2秒のタイムアウト
    })

    if (response.ok) {
      const data = await response.json()
      // 指定されたモデルが存在するか確認
      const models = data.models || []
      return models.some((m: any) => m.name === config.model || m.name.startsWith(config.model))
    }

    return false
  } catch (error) {
    console.log('Ollama not available:', error)
    return false
  }
}

// Ollama APIを呼び出して、テキスト生成を実行
export async function callOllamaAPI(prompt: string): Promise<string | null> {
  const config = getOllamaConfig()

  if (!config.enabled) {
    console.log('Ollama is disabled via environment variable')
    return null
  }

  try {
    const request: OllamaGenerateRequest = {
      model: config.model,
      prompt: prompt,
      stream: false,
      format: 'json' // JSON形式での応答を要求
    }

    const response = await fetch(`${config.url}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000) // 30秒のタイムアウト
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Ollama API error: ${response.status} - ${error}`)
      return null
    }

    const data = await response.json() as OllamaGenerateResponse

    if (!data.response) {
      console.error('No response from Ollama')
      return null
    }

    return data.response
  } catch (error) {
    console.error('Failed to call Ollama API:', error)
    return null
  }
}

// 観察記録分析用のOllama向けプロンプトを生成
export function createOllamaAnalysisPrompt(
  observationText: string,
  studentNames?: string[],
  location?: string,
  includeTextImprovement: boolean = false
): string {
  // Ollama向けにシンプルで明確なプロンプト
  const prompt = `あなたは教員の観察記録を分析するAIです。以下の観察記録を分析して、JSON形式で結果を返してください。
${includeTextImprovement ? '音声入力されたテキストを整形し、要約も生成してください。' : ''}

観察記録: "${observationText}"
${studentNames && studentNames.length > 0 ? `対象生徒: ${studentNames.join(', ')}` : ''}
${location ? `場所: ${location}` : ''}

以下の形式のJSONのみを出力してください。説明文は不要です:
{
  "tags": [
    { "label": "タグ名", "category": "behavioral|academic|health|family|social|emergency のいずれか" }
  ],
  "priority": "urgent|high|normal|low のいずれか",
  "type": "behavioral|academic|health|family|social|emergency のいずれか",
  "location": "場所",
  "sentiment": -1.0から1.0の数値,
  "keywords": ["キーワード1", "キーワード2"],
  "suggestedActions": ["推奨アクション1", "推奨アクション2"],
  "confidence": 0.0から1.0の数値${includeTextImprovement ? `,
  "restructuredText": "整形されたテキスト（句読点追加、文法修正、論理的な流れ）",
  "summary": "要約（3文以内）"` : ''}
}

カテゴリの意味:
- behavioral: 行動（いじめ、孤立など）
- academic: 学習（成績、宿題など）
- health: 健康（体調、メンタルなど）
- family: 家庭
- social: 社会性（友人関係など）
- emergency: 緊急対応が必要

優先度:
- urgent: 即座の対応必要（いじめ、暴力など）
- high: 早急な対応推奨
- normal: 通常
- low: 経過観察${includeTextImprovement ? `

テキスト整形:
- 句読点を適切に追加
- 文法修正と論理的な流れ
- 冗長な表現を簡潔に` : ''}`

  return prompt
}

// Ollamaレスポンスを構造化データに変換
export function parseOllamaResponse(response: string): any | null {
  try {
    // レスポンスがすでにJSONの場合
    if (response.trim().startsWith('{')) {
      return JSON.parse(response)
    }

    // JSONコードブロックが含まれている場合
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    // { } で囲まれた部分を抽出
    const objectMatch = response.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }

    console.warn('Could not extract JSON from Ollama response')
    return null
  } catch (error) {
    console.error('Failed to parse Ollama response:', error)
    return null
  }
}