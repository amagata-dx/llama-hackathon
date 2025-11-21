"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
        {isUser ? (
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src="/llama.png" alt="ラマちゃん" />
            <AvatarFallback className="bg-accent/10 text-accent-foreground">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <Card
        className={cn(
          "flex-1 p-4 shadow-sm",
          isUser ? "bg-primary/10 border-primary/20" : "bg-accent/5 border-accent/20",
        )}
      >
        <p className="text-sm font-semibold mb-2 text-foreground">{isUser ? "あなた" : "ラマちゃん"}</p>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </Card>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-4">
      <Avatar className="w-10 h-10 border-2 border-accent">
        <AvatarImage src="/llama.png" alt="AIアシスタント" />
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
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 overflow-hidden">
        <img src="/llama.png" alt="AIアシスタント" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">ラマちゃんとの会話ルール</h2>
      <div className="text-left max-w-md mx-auto space-y-3 text-muted-foreground">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="font-bold text-primary">1</span>
          </div>
          <p className="text-sm">マイクボタンをクリックするラマ</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="font-bold text-primary">2</span>
          </div>
          <p className="text-sm">ラマちゃんに自由に話しかけてラマ</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="font-bold text-primary">3</span>
          </div>
          <p className="text-sm">ラマちゃんが全力で回答するラマ</p>
        </div>
      </div>
    </div>
  )
}
