"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionHook {
  isMicOn: boolean
  isListening: boolean
  transcript: string
  error: string | null
  toggleMic: () => void
}

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void
  onError?: (error: string) => void
}

export function useSpeechRecognition({ onResult, onError }: UseSpeechRecognitionProps): SpeechRecognitionHook {
  const [isMicOn, setIsMicOn] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const isMicOnRef = useRef(isMicOn)

  // isMicOnの変更をisMicOnRefに反映
  useEffect(() => {
    isMicOnRef.current = isMicOn
  }, [isMicOn])

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      const errorMsg = "このブラウザは音声認識をサポートしていません"
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "ja-JP"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
        // isMicOnがtrueの時だけtranscriptを更新
        if (!isMicOnRef.current) return

        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript
            if (event.results[i].isFinal) {
            finalTranscript += transcriptPart
            } else {
            interimTranscript += transcriptPart
            }
        }

        setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)

      const errorMsg = event.error === "no-speech" ? "音声が検出されませんでした" : "音声認識エラーが発生しました"

      setError(errorMsg)
      onError?.(errorMsg)
    }

    recognition.onend = () => {
      setIsListening(false)
      console.log("Mic end")
    }

    recognitionRef.current = recognition

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [isMicOn, onResult, onError])

  const toggleMic = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.("音声認識が利用できません")
      return
    }

    if (isMicOn) {
      onResult(transcript)
      recognitionRef.current.stop()
      setIsListening(false)
      setIsMicOn(false)
      setTranscript("")
      console.log("Mic off")
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setIsMicOn(true)
        setError(null)
        console.log("Mic on")
      } catch (e) {
        console.error("Failed to start recognition:", e)
        onError?.("音声認識の開始に失敗しました")
      }
    }
  }, [isMicOn, onError])

  return {
    isMicOn,
    isListening,
    transcript,
    error,
    toggleMic,
  }
}
