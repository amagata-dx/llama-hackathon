// 音声認識のカスタムフック
import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onResult?: (transcript: string) => void
  onEnd?: () => void
}

interface UseSpeechRecognitionReturn {
  transcript: string
  interimTranscript: string
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
  isSupported: boolean
}

// Web Speech APIの型定義
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  onstart: () => void
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
      isFinal: boolean
    }
    length: number
  }
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType
    webkitSpeechRecognition: new () => SpeechRecognitionType
  }
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    continuous = true,
    interimResults = true,
    lang = 'ja-JP',
    onResult,
    onEnd
  } = options

  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const isListeningRef = useRef(false)
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // SpeechRecognitionインスタンスの初期化
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let tempInterimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const currentTranscript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += currentTranscript + ' '
        } else {
          tempInterimTranscript += currentTranscript
        }
      }

      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = prev + finalTranscript
          // onResultは最新の値で呼び出す
          if (onResult) {
            onResult(newTranscript)
          }
          return newTranscript
        })
        setInterimTranscript('')
      } else {
        setInterimTranscript(tempInterimTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      let errorMessage = '音声認識エラーが発生しました'

      switch (event.error) {
        case 'no-speech':
          // 無音検出エラーは無視して継続（一時停止と認識）
          console.log('一時的な無音を検出しました。音声認識を継続します。')
          // エラーとして扱わず、認識を再開
          if (continuous && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Already listening')
            }
          }
          return // エラーメッセージを設定せずに早期リターン
        case 'audio-capture':
          errorMessage = 'マイクが使用できません'
          break
        case 'not-allowed':
          errorMessage = 'マイクへのアクセスが拒否されました'
          break
        case 'network':
          errorMessage = 'ネットワークエラーが発生しました'
          break
      }

      setError(errorMessage)
      setIsListening(false)
      isListeningRef.current = false
    }

    recognition.onend = () => {
      // continuous モードの場合、意図しない終了時は再開
      if (continuous && isListeningRef.current) {
        console.log('音声認識が終了しました。再開を試みます。')
        try {
          recognition.start()
        } catch (e) {
          console.log('音声認識の再開に失敗しました:', e)
          setIsListening(false)
          isListeningRef.current = false
          if (onEnd) {
            onEnd()
          }
        }
      } else {
        setIsListening(false)
        isListeningRef.current = false
        if (onEnd) {
          onEnd()
        }
      }
    }

    recognition.onstart = () => {
      setIsListening(true)
      isListeningRef.current = true
      setError(null)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('音声認識の停止エラー:', e)
        }
      }
    }
  }, [continuous, interimResults, lang, onResult, onEnd, isSupported])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('お使いのブラウザは音声認識に対応していません')
      return
    }

    if (recognitionRef.current && !isListeningRef.current) {
      try {
        isListeningRef.current = true
        recognitionRef.current.start()
        setError(null)
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
        setError('音声認識の開始に失敗しました')
        isListeningRef.current = false
      }
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      isListeningRef.current = false
      recognitionRef.current.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported
  }
}