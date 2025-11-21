"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface MicControlProps {
  isMicOn: boolean
  isListening: boolean
  transcript: string
  onToggleMic: () => void
  onTextSubmit: (text: string) => void
}

export function MicControl({ isMicOn, isListening, transcript, onToggleMic, onTextSubmit }: MicControlProps) {
  const [textInput, setTextInput] = useState("")

  const handleSubmit = () => {
    if (textInput.trim() && !isListening) {
      onTextSubmit(textInput.trim())
      setTextInput("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enterで送信（通常のEnterは改行として扱う）
    if (e.key === "Enter" && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      if (textInput.trim() && !isListening) {
        handleSubmit()
      }
    }
  }

  return (
    <>
      {/* Transcript Display */}
      {transcript && (
        <Card className="absolute bottom-28 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-primary/30 shadow-xl z-10">
          <p className="text-sm text-foreground leading-relaxed">{transcript}</p>
        </Card>
      )}

      {/* Input Control - Mic, Text Area, and Send Button */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Card className="p-3 bg-card/95 backdrop-blur-sm border-primary/30 shadow-xl">
          <div className="flex gap-3 items-end">
            {/* Mic Button */}
            <Button
              size="lg"
              onClick={onToggleMic}
              className={cn(
                "w-14 h-14 rounded-full shadow-lg transition-all duration-300 border-2 shrink-0",
                isMicOn
                  ? "bg-destructive hover:bg-destructive/90 border-destructive-foreground/20 animate-pulse"
                  : "bg-primary hover:bg-primary/90 border-primary-foreground/20",
              )}
              aria-label={isMicOn ? "マイクをオフにする" : "マイクをオンにする"}
            >
              {isMicOn ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {/* Text Input Area */}
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              className="flex-1 min-h-[60px] max-h-[120px] px-3 py-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
            />

            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={!textInput.trim() || isListening}
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
              aria-label="送信"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
