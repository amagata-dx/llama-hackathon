"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatHistoryProps {
  messages: Message[]
  isThinking: boolean
}

export function ChatHistory({ messages, isThinking }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  return (
    <div className="w-full lg:w-1/2 bg-card border-l border-border flex flex-col h-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            messages.map((message, index) => <MessageBubble key={index} message={message} />)
          )}

          {isThinking && <ThinkingIndicator />}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-4", isUser && "flex-row-reverse")}>
      <Avatar className={cn("w-10 h-10 border-2", isUser ? "border-primary" : "border-accent")}>
        <AvatarFallback className={cn(isUser ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground")}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>

      <Card
        className={cn(
          "flex-1 p-4 shadow-sm",
          isUser ? "bg-primary/10 border-primary/20" : "bg-accent/5 border-accent/20",
        )}
      >
        <p className="text-sm font-semibold mb-2 text-foreground">{isUser ? "あなた" : "AIアシスタント"}</p>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </Card>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-4">
      <Avatar className="w-10 h-10 border-2 border-accent">
        <AvatarFallback className="bg-accent/10 text-accent-foreground">
          <Bot className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>

      <Card className="flex-1 p-4 bg-accent/5 border-accent/20 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">返答を考えています...</span>
        </div>
      </Card>
    </div>
  )
}

function WelcomeMessage() {
  return (
    <div className="text-center py-12 px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
        <Bot className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">AIアバターチャットへようこそ</h2>
      <div className="text-left max-w-md mx-auto space-y-3 text-muted-foreground">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">1</span>
          </div>
          <p className="text-sm">マイクボタンをクリックして音声入力を開始</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">2</span>
          </div>
          <p className="text-sm">アバターに自由に話しかけてみましょう</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">3</span>
          </div>
          <p className="text-sm">AIアバターが音声で返答します</p>
        </div>
      </div>
    </div>
  )
}
