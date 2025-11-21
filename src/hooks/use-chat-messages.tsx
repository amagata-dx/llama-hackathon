"use client"

import { useState, useCallback } from "react"

export interface Message {
  role: "user" | "assistant"
  content: string
}

interface UseChatMessagesReturn {
  messages: Message[]
  isThinking: boolean
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string) => void
  updateLastAssistantMessage: (content: string) => void
  clearMessages: () => void
}

export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }])
    setIsThinking(true)
  }, [])

  const addAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }])
    setIsThinking(false)
  }, [])

  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev]
      const lastIndex = newMessages.length - 1
      if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
        newMessages[lastIndex] = { role: "assistant", content }
      } else {
        newMessages.push({ role: "assistant", content })
      }
      return newMessages
    })
    setIsThinking(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setIsThinking(false)
  }, [])

  return {
    messages,
    isThinking,
    addUserMessage,
    addAssistantMessage,
    updateLastAssistantMessage,
    clearMessages,
  }
}
