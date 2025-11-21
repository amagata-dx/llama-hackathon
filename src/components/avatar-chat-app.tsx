"use client"

import { useState, useCallback } from "react"
import { AvatarScene } from "./avatar-scene"
import { ChatHistory } from "./chat-history"
import { MicControl } from "./mic-control"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useChatMessages } from "@/hooks/use-chat-messages"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/sonner"
import { sendChatMessage } from "@/lib/api"

export default function AvatarChatApp() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<"happy" | "sad" | "angry" | "surprised" | "neutral">("neutral")
  const { toast } = useToast()
  console.log(currentEmotion)

  const { messages, isThinking, addUserMessage, addAssistantMessage, updateLastAssistantMessage } = useChatMessages()

  const handleUserMessage = useCallback(
    async (text: string) => {
      addUserMessage(text)

      try {
        const result = await sendChatMessage(
          [
            ...messages,
            { role: "user", content: text },
          ],
          (content) => {
            updateLastAssistantMessage(content)
          },
          () => {
            // ストリーミング表示開始
            setIsSpeaking(true)
          },
          () => {
            // ストリーミング表示終了
            setIsSpeaking(false)
          }
        )

        // ストリーミング完了時に最終的なメッセージを設定
        updateLastAssistantMessage(result.answer)
        // emotionを更新
        setCurrentEmotion(result.emotion)
      } catch (error) {
        console.error("Chat error:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "メッセージの送信に失敗しました。もう一度お試しください。",
        })
        addAssistantMessage("申し訳ございません。エラーが発生しました。もう一度お試しください。")
      }
    },
    [messages, addUserMessage, addAssistantMessage, updateLastAssistantMessage, toast],
  )

  const {
    isMicOn,
    isListening,
    transcript,
    toggleMic,
  } = useSpeechRecognition({
    onResult: handleUserMessage,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "音声認識エラー",
        description: error,
      })
    },
  })

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground">ラマちゃん's ROOM</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Avatar Scene */}
          <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-background via-background to-accent/5">
            <AvatarScene isSpeaking={isSpeaking} isListening={isListening} isThinking={isThinking} emotion={currentEmotion} />

            <MicControl
              isMicOn={isMicOn}
              isListening={isListening}
              transcript={transcript}
              onToggleMic={toggleMic}
              onTextSubmit={handleUserMessage}
            />
          </div>

          {/* Chat History */}
          <ChatHistory messages={messages} isThinking={isThinking} />
        </div>
      </div>
      <Toaster />
    </>
  )
}
