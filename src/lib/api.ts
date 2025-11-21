import type { Message } from "@/hooks/use-chat-messages"
import { SYSTEM_PROMPT } from "./prompt";

// APIリクエスト用のメッセージ型（システムロールを含む）
type ApiMessage = Message | { role: "system"; content: string }

interface ChatResponse {
  choices: Array<{
    finish_reason?: string
    index: number
    logprobs?: null
    delta?: {
      content?: string
      role?: string
    }
    message?: {
      content: string
      role: string
    }
  }>
  created?: number
  id?: string
  model?: string
  object?: string
  system_fingerprint?: string
  usage?: {
    completion_tokens: number
    completion_tokens_after_first_per_sec: number
    completion_tokens_after_first_per_sec_first_ten: number
    completion_tokens_after_first_per_sec_graph: number
    completion_tokens_per_sec: number
    end_time: number
    is_last_response: boolean
    prompt_tokens: number
    stop_reason: string
    time_to_first_token: number
    time_to_first_token_graph: number
    total_latency: number
    total_tokens: number
    total_tokens_per_sec: number
  }
}

// システムプロンプトを取得（環境変数から読み込む、デフォルト値あり）
function getSystemPrompt(): string {
  return SYSTEM_PROMPT
}

interface StructuredResponse {
  answer: string
  emotion: "happy" | "sad" | "angry" | "surprised" | "neutral"
}

export interface ChatResult {
  answer: string
  emotion: "happy" | "sad" | "angry" | "surprised" | "neutral"
}

export async function sendChatMessage(
  messages: Message[],
  onChunk?: (content: string) => void,
  onDisplayStart?: () => void,
  onDisplayEnd?: () => void
): Promise<ChatResult> {
  // システムプロンプトを取得
  const systemPrompt = getSystemPrompt()
  
  // メッセージ配列の先頭にシステムプロンプトを追加
  const messagesWithSystem: ApiMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ]
  
  // APIリクエスト
  const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_LLAMA_API_KEY}` },
    body: JSON.stringify({
        "stream": false,
        //"model": "Llama-4-Maverick-17B-128E-Instruct",
        "model": "Meta-Llama-3.3-70B-Instruct",
        "messages": messagesWithSystem,
        "response_format": { "type": "json_schema", "json_schema": { "name": "response", "schema": { "type": "object", "properties": { "answer": { "type": "string" }, "emotion": { "type": "string", "enum": ["happy", "sad", "angry", "surprised", "neutral"] } } } } },
    }),
  })
  
  if (!response.ok) {
    throw new Error("API request failed")
  }

  // レスポンスをパース
  const data = await response.json() as ChatResponse
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error("No content in response")
  }

  // contentはJSON文字列なので、パースしてanswerとemotionを取得
  let structuredResponse: StructuredResponse
  try {
    structuredResponse = JSON.parse(content) as StructuredResponse
  } catch (e) {
    throw new Error("Failed to parse structured response")
  }

  const fullContent = structuredResponse.answer
  const emotion = structuredResponse.emotion

  // タイプライター効果: 読める速度で表示
  const charsPerInterval = 2 // 1回の更新で表示する文字数
  const intervalMs = 100 // 更新間隔（ミリ秒）

  let displayedContent = ""
  let displayTimer: ReturnType<typeof setInterval> | null = null
  let isDisplayStarted = false
  let isDisplayEnded = false

  // 表示開始を通知
  if (!isDisplayStarted) {
    isDisplayStarted = true
    onDisplayStart?.()
  }

  // タイプライター効果で表示
  return new Promise((resolve) => {
    displayTimer = setInterval(() => {
      if (displayedContent.length < fullContent.length) {
        const remaining = fullContent.slice(displayedContent.length)
        const toDisplay = remaining.slice(0, charsPerInterval)
        displayedContent += toDisplay
        onChunk?.(displayedContent)
      } else {
        // 表示完了
        if (displayTimer) {
          clearInterval(displayTimer)
          displayTimer = null
        }
        if (!isDisplayEnded) {
          isDisplayEnded = true
          onDisplayEnd?.()
        }
        resolve({ answer: fullContent, emotion })
      }
    }, intervalMs)
  })
}

interface InterviewSuggestionResponse {
  suggestions: string;
  checkItems: Array<{
    text: string;
  }>;
}

export interface InterviewSuggestionsResult {
  suggestions: string;
  checkItems: Array<{
    id: string;
    text: string;
    checked: boolean;
  }>;
}

const INTERVIEW_SUGGESTION_SYSTEM_PROMPT = `
You are an expert educational AI assistant specialized in providing interview support for teachers conducting student interviews.

Your task is to analyze the interview content and provide:
1. Actionable check items that the teacher should verify or follow up on
2. Additional suggestions and advice based on the interview content and student's risk level

Output Format:
You must return ONLY a valid JSON object matching the following structure:

{
  "suggestions": "Detailed suggestions and advice for the teacher based on the interview content",
  "checkItems": [
    {
      "text": "Specific action item that should be checked or followed up"
    }
  ]
}

Rules:
- "suggestions" should provide comprehensive advice considering the student's risk level and interview content
- "checkItems" should be concrete, actionable items (typically 4-8 items)
- Consider the urgency and severity of the situation
- Provide practical, teacher-friendly recommendations
- Do not include any text outside the JSON block
- All text should be in Japanese
`;

export async function getInterviewSuggestions(
  alertLevel: string,
  alertCategory: string,
  studentName: string,
  interviewContent: string
): Promise<InterviewSuggestionsResult> {
  const userPrompt = `
Analyze the following interview record and provide suggestions.

[Student Information]
Name: ${studentName}
Risk Level: ${alertLevel}
Category: ${alertCategory}

[Interview Content]
${interviewContent}

Based on this interview, provide check items and suggestions for the teacher.
`;

  try {
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_LLAMA_API_KEY}`
      },
      body: JSON.stringify({
        "stream": false,
        "model": "Meta-Llama-3.3-70B-Instruct",
        "messages": [
          { role: "system", content: INTERVIEW_SUGGESTION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        "temperature": 0.3,
        "response_format": { "type": "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from LLM");
    }

    // Parse JSON from content (handling potential markdown code blocks)
    const jsonString = content.replace(/```json\n|\n```/g, "").trim();
    const result = JSON.parse(jsonString) as InterviewSuggestionResponse;

    // Convert checkItems to include id and checked status
    const checkItems = result.checkItems.map((item, index) => ({
      id: `check-${Date.now()}-${index}`,
      text: item.text,
      checked: false
    }));

    return {
      suggestions: result.suggestions,
      checkItems
    };

  } catch (error) {
    console.error("Error calling interview suggestions API:", error);
    throw error;
  }
}

