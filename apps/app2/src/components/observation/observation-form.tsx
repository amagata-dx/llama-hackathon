// 観察記録フォームコンポーネント
import { useState } from 'react'
import { Save, AlertCircle, Mic } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StudentSelector } from './student-selector'
import { TagDisplay } from './tag-display'
import { VoiceRecorder } from './voice-recorder'
import type { StudentReference, Tag, ObservationType, PriorityLevel, InputMethod } from '@/types'
import { tagCategories, priorityColors } from '@/data/tag-categories'

interface ObservationFormProps {
  onSubmit: (data: ObservationFormData) => void
  isSubmitting?: boolean
}

export interface ObservationFormData {
  students: StudentReference[]
  content: {
    text: string
    audioBlob?: Blob
    audioUrl?: string
    duration?: number
  }
  type: ObservationType
  tags: Tag[]
  priority: PriorityLevel
  location?: string
  templateId?: string
  inputMethod: InputMethod
  isOfflineCreated: boolean
  teacherId: string
  aiAnalysis?: {
    sentiment: number
    keywords: string[]
    suggestedActions: string[]
    confidence: number
  }
}

export function ObservationForm({ onSubmit, isSubmitting = false }: ObservationFormProps) {
  // フォームの状態管理
  const [students, setStudents] = useState<StudentReference[]>([])
  const [contentText, setContentText] = useState('')
  const [type, setType] = useState<ObservationType>('behavioral')
  const [tags, setTags] = useState<Tag[]>([])
  const [priority, setPriority] = useState<PriorityLevel>('normal')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [useVoiceInput, setUseVoiceInput] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  // 音声入力からテキストを受け取る
  const handleVoiceTranscript = (transcript: string, blob?: Blob) => {
    setContentText(transcript)
    if (blob) {
      setAudioBlob(blob)
    }
    // 音声入力後は手入力モードに戻す
    setUseVoiceInput(false)
  }

  // バリデーション
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (students.length === 0) {
      newErrors.students = '生徒を選択してください'
    }

    if (!contentText.trim()) {
      newErrors.content = '観察内容を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const formData: ObservationFormData = {
      students,
      content: {
        text: contentText.trim(),
        audioBlob: audioBlob || undefined,
      },
      type,
      tags,
      priority,
      location: location.trim() || undefined,
      inputMethod: audioBlob ? 'voice' : 'text',
      isOfflineCreated: false,
      teacherId: 'teacher-001', // TODO: 実際の教員IDを使用
    }

    onSubmit(formData)
  }

  // フォームリセット
  const resetForm = () => {
    setStudents([])
    setContentText('')
    setType('behavioral')
    setTags([])
    setPriority('normal')
    setLocation('')
    setErrors({})
    setAudioBlob(null)
    setUseVoiceInput(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しい観察記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 生徒選択 */}
          <div>
            <StudentSelector
              selectedStudents={students}
              onStudentsChange={setStudents}
              multiple={true}
              required={true}
            />
            {errors.students && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.students}
              </p>
            )}
          </div>

          {/* 観察内容 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">
                観察内容 <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant={useVoiceInput ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseVoiceInput(!useVoiceInput)}
              >
                <Mic className="h-4 w-4 mr-1" />
                {useVoiceInput ? '音声入力中' : '音声入力'}
              </Button>
            </div>

            {useVoiceInput ? (
              <VoiceRecorder
                onTranscriptComplete={handleVoiceTranscript}
                placeholder="観察した内容を音声で入力..."
              />
            ) : (
              <>
                <Textarea
                  id="content"
                  placeholder="観察した内容を詳しく記入してください..."
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={4}
                  className="mt-1"
                  data-testid="observation-content"
                />
                {contentText && audioBlob && (
                  <p className="text-xs text-blue-600 mt-1">
                    音声入力から変換されたテキストです
                  </p>
                )}
              </>
            )}

            {errors.content && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.content}
              </p>
            )}
          </div>

          {/* カテゴリ選択 */}
          <div>
            <Label htmlFor="type">カテゴリ</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ObservationType)}
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="observation-type"
            >
              {Object.entries(tagCategories).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.icon} {info.label} - {info.description}
                </option>
              ))}
            </select>
          </div>

          {/* 優先度選択 */}
          <div>
            <Label htmlFor="priority">優先度</Label>
            <div className="flex gap-2 mt-1">
              {Object.entries(priorityColors).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key as PriorityLevel)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    priority === key
                      ? `${info.bgColor} ${info.color} ring-2 ring-offset-2 ring-blue-500`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`priority-${key}`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          {/* 場所 */}
          <div>
            <Label htmlFor="location">場所（任意）</Label>
            <Input
              id="location"
              type="text"
              placeholder="例: 教室、廊下、体育館..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
              data-testid="observation-location"
            />
          </div>

          {/* タグ */}
          <TagDisplay
            tags={tags}
            onTagsChange={setTags}
            allowEdit={true}
            showCategory={true}
          />

          {/* ボタン */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="save-observation"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  記録を保存
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              リセット
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}