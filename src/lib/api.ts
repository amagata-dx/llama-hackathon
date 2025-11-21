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

export async function sendChatMessage(
  messages: Message[],
  onChunk?: (content: string) => void,
  onDisplayStart?: () => void,
  onDisplayEnd?: () => void
): Promise<string> {
  // システムプロンプトを取得
  const systemPrompt = getSystemPrompt()
  
  // メッセージ配列の先頭にシステムプロンプトを追加
  const messagesWithSystem: ApiMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ]
  
  // 既存のAPI実装
  const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_LLAMA_API_KEY}` },
    body: JSON.stringify({
        "stream": true,
        "model": "Llama-4-Maverick-17B-128E-Instruct",
        "messages": messagesWithSystem,
    }),
  })
  
  if (!response.ok) {
    throw new Error("API request failed")
  }
  
  if (!response.body) {
    throw new Error("Response body is null")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ""
  let displayedContent = ""
  let isStreamingComplete = false

  // タイプライター効果: 読める速度で表示
  const charsPerInterval = 2 // 1回の更新で表示する文字数
  const intervalMs = 100 // 更新間隔（ミリ秒）

  let displayTimer: ReturnType<typeof setInterval> | null = null

  let isDisplayStarted = false
  let isDisplayEnded = false

  const startDisplayLoop = () => {
    if (displayTimer) return // 既に開始している

    // 表示開始を通知
    if (!isDisplayStarted) {
      isDisplayStarted = true
      onDisplayStart?.()
    }

    displayTimer = setInterval(() => {
      if (displayedContent.length < fullContent.length) {
        const remaining = fullContent.slice(displayedContent.length)
        const toDisplay = remaining.slice(0, charsPerInterval)
        displayedContent += toDisplay
        onChunk?.(displayedContent)
      } else if (isStreamingComplete && displayTimer) {
        // ストリーミング完了かつ表示も完了したらタイマーを停止
        clearInterval(displayTimer)
        displayTimer = null
        if (!isDisplayEnded) {
          isDisplayEnded = true
          onDisplayEnd?.()
        }
      }
    }, intervalMs)
  }

  try {
    // ストリーミングデータの受信
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        isStreamingComplete = true
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") {
            isStreamingComplete = true
            continue
          }

          try {
            const parsed = JSON.parse(data) as ChatResponse
            const content = parsed.choices[0]?.delta?.content || parsed.choices[0]?.message?.content || ""
            if (content) {
              fullContent += content
              // 表示ループを開始（まだ開始していない場合）
              startDisplayLoop()
            }
          } catch (e) {
            // JSON parse error, skip this line
          }
        }
      }
    }

    // ストリーミング完了後、残りのコンテンツを表示するまで待機
    while (displayedContent.length < fullContent.length) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    // 最終的な完全なコンテンツを保証
    if (displayedContent !== fullContent) {
      displayedContent = fullContent
      onChunk?.(fullContent)
    }

    // 表示が完了したことを通知（まだ通知していない場合）
    if (isDisplayStarted && !isDisplayEnded) {
      isDisplayEnded = true
      onDisplayEnd?.()
    }
  } finally {
    if (displayTimer) {
      clearInterval(displayTimer)
    }
    reader.releaseLock()
  }

  return fullContent
}

