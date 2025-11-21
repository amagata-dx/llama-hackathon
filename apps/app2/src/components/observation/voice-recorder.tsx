// 音声録音コンポーネント
import { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoiceRecording } from '@/hooks/use-voice-recording'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { toast } from 'sonner'

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, audioBlob?: Blob) => void
  placeholder?: string
}

export function VoiceRecorder({
  onTranscriptComplete,
  placeholder = '観察内容を音声で入力...'
}: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useVoiceRecording()

  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error: recognitionError,
    isSupported
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'ja-JP'
    // onEndコールバックを削除 - 音声認識の終了で録音を止めない
  })

  // 録音停止時に自動で結果を送信
  useEffect(() => {
    if (!isRecording && !isListening && !hasSubmitted && !isProcessing) {
      // 録音と認識が両方停止して、まだ送信していない場合

      if (transcript && transcript.trim()) {
        // transcriptがある場合は送信
        console.log('録音終了・自動送信:', transcript)
        const currentTranscript = transcript
        const currentAudioBlob = audioBlob

        setIsProcessing(true)
        setHasSubmitted(true)

        // 少し待ってから送信（音声認識の最終処理を待つ）
        setTimeout(() => {
          if (currentTranscript && currentTranscript.trim()) {
            onTranscriptComplete(currentTranscript, currentAudioBlob || undefined)
            toast.success('音声入力内容が反映されました')
          } else {
            toast.error('音声認識結果が空です。もう一度お試しください。')
            setHasSubmitted(false)
          }
          setIsProcessing(false)
        }, 500)
      } else if (audioBlob) {
        // 録音はされたが音声認識結果が無い場合
        console.warn('音声認識結果が空')
        toast.warning('音声が認識されませんでした。はっきりと話してもう一度お試しください。')
      }
    }
  }, [isRecording, isListening, transcript, hasSubmitted, isProcessing, audioBlob, onTranscriptComplete])

  // 録音の開始/停止
  const handleToggleRecording = async () => {
    if (isRecording) {
      // 停止処理
      stopRecording()
      stopListening()
      // useEffectで自動送信されるので、ここでは送信しない
    } else {
      // 開始処理
      resetTranscript()
      clearRecording()
      setHasSubmitted(false) // 送信フラグをリセット
      await startRecording()
      startListening()
    }
  }

  // やり直し
  const handleRetry = () => {
    clearRecording()
    resetTranscript()
    setHasSubmitted(false)
  }

  // 文字起こし結果の確定（手動送信）
  const handleConfirmTranscript = () => {
    if (transcript && !hasSubmitted) {
      console.log('手動で確定:', transcript)
      onTranscriptComplete(transcript, audioBlob || undefined)
      setHasSubmitted(true)
      // 送信後にクリア
      setTimeout(() => {
        clearRecording()
        resetTranscript()
        setHasSubmitted(false)
      }, 100)
    }
  }

  // 時間のフォーマット
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isSupported) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          お使いのブラウザは音声入力に対応していません。
          ChromeまたはEdgeをご利用ください。
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">音声入力</h3>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              録音中
            </Badge>
          )}
        </div>

        {/* 録音ボタン */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={`
              relative w-24 h-24 rounded-full transition-all duration-200
              flex items-center justify-center
              ${isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl
            `}
            data-testid="voice-record-btn"
            aria-label={isRecording ? '録音停止' : '録音開始'}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          {/* 録音時間 */}
          {isRecording && (
            <div className="text-2xl font-mono font-bold text-gray-700">
              {formatTime(duration)}
            </div>
          )}

          <p className="text-sm text-gray-600 text-center">
            {isRecording
              ? 'タップして録音を停止'
              : 'タップして音声入力開始'}
          </p>
        </div>

        {/* リアルタイム文字起こし */}
        {(transcript || interimTranscript) && (
          <div className="p-4 bg-gray-50 rounded-lg min-h-[100px]">
            <p className="text-sm text-gray-500 mb-2">認識中のテキスト:</p>
            <p className="text-base">
              <span className="text-gray-900">{transcript}</span>
              <span className="text-gray-400">{interimTranscript}</span>
            </p>
            {transcript && !isRecording && !hasSubmitted && (
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleConfirmTranscript}
                  size="sm"
                  variant="default"
                >
                  この内容で確定
                </Button>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  やり直す
                </Button>
              </div>
            )}
            {hasSubmitted && (
              <div className="mt-3 text-sm text-green-600">
                ✅ 音声入力内容が反映されました
              </div>
            )}
          </div>
        )}

        {/* 音声プレイヤー */}
        {audioUrl && !isRecording && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">録音した音声:</p>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}

        {/* エラー表示 */}
        {(recordingError || recognitionError) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {recordingError || recognitionError}
            </p>
          </div>
        )}

        {/* 使い方のヒント */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 ヒント:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>マイクボタンをタップして録音を開始</li>
            <li>話し終わったらもう一度タップして停止</li>
            <li>リアルタイムで文字起こしされます</li>
            <li>音声は最大5分まで録音可能です</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}