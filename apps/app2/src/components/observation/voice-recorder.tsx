// 音声録音コンポーネント
import { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoiceRecording } from '@/hooks/use-voice-recording'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, audioBlob?: Blob) => void
  placeholder?: string
}

export function VoiceRecorder({
  onTranscriptComplete,
  placeholder = '観察内容を音声で入力...'
}: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)

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
    lang: 'ja-JP',
    onEnd: () => {
      if (isRecording) {
        stopRecording()
      }
    }
  })

  // 録音の開始/停止
  const handleToggleRecording = async () => {
    if (isRecording) {
      // 停止処理
      stopRecording()
      stopListening()
      setIsProcessing(true)

      // 少し待ってから文字起こし結果を送信
      setTimeout(() => {
        if (transcript) {
          onTranscriptComplete(transcript, audioBlob || undefined)
        }
        setIsProcessing(false)
      }, 500)
    } else {
      // 開始処理
      resetTranscript()
      clearRecording()
      await startRecording()
      startListening()
    }
  }

  // やり直し
  const handleRetry = () => {
    clearRecording()
    resetTranscript()
  }

  // 文字起こし結果の確定
  const handleConfirmTranscript = () => {
    if (transcript) {
      onTranscriptComplete(transcript, audioBlob || undefined)
      clearRecording()
      resetTranscript()
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
            {transcript && !isRecording && (
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