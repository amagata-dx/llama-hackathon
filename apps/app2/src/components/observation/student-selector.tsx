// 生徒選択コンポーネント
import { useState, useMemo } from 'react'
import { Check, X, Search, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { Student, StudentReference } from '@/types'
import { mockStudents } from '@/data/mock-students'

interface StudentSelectorProps {
  selectedStudents: StudentReference[]
  onStudentsChange: (students: StudentReference[]) => void
  multiple?: boolean
  required?: boolean
}

export function StudentSelector({
  selectedStudents,
  onStudentsChange,
  multiple = true,
  required = true,
}: StudentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  // 生徒のフィルタリング
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return mockStudents

    const query = searchQuery.toLowerCase()
    return mockStudents.filter(student =>
      student.name.toLowerCase().includes(query) ||
      student.furigana.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // 最近の生徒を表示（観察記録が多い順）
  const recentStudents = useMemo(() => {
    return [...mockStudents]
      .sort((a, b) => (b.recentObservationCount || 0) - (a.recentObservationCount || 0))
      .slice(0, 5)
  }, [])

  // 生徒の選択/選択解除
  const toggleStudent = (student: Student, role: StudentReference['role'] = 'subject') => {
    const isSelected = selectedStudents.some(s => s.id === student.id)

    if (isSelected) {
      onStudentsChange(selectedStudents.filter(s => s.id !== student.id))
    } else {
      const newStudent: StudentReference = {
        id: student.id,
        name: student.name,
        class: student.class,
        role,
      }

      if (multiple) {
        onStudentsChange([...selectedStudents, newStudent])
      } else {
        onStudentsChange([newStudent])
      }
    }
  }

  // 選択された生徒の削除
  const removeStudent = (studentId: string) => {
    onStudentsChange(selectedStudents.filter(s => s.id !== studentId))
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="student-selector">
          生徒選択 {required && <span className="text-red-500">*</span>}
        </Label>
        {multiple && (
          <p className="text-sm text-gray-500 mt-1">
            複数の生徒を選択できます
          </p>
        )}
      </div>

      {/* 選択された生徒 */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStudents.map(student => (
            <Badge
              key={student.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <span>{student.name}</span>
              <span className="text-xs text-gray-500">({student.class})</span>
              <button
                onClick={() => removeStudent(student.id)}
                className="ml-1 hover:bg-gray-200 rounded p-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 検索ボックス */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="student-selector"
          type="text"
          placeholder="生徒名、ふりがな、クラスで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* クイック選択（最近の生徒） */}
      {!showAll && !searchQuery && (
        <Card className="p-3">
          <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
            <Users className="h-4 w-4" />
            最近の生徒
          </div>
          <div className="flex flex-wrap gap-2">
            {recentStudents.map(student => {
              const isSelected = selectedStudents.some(s => s.id === student.id)
              return (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors",
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )}
                  type="button"
                >
                  {student.name}
                  {student.recentObservationCount && student.recentObservationCount > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      ({student.recentObservationCount})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            type="button"
          >
            すべての生徒を表示
          </button>
        </Card>
      )}

      {/* 全生徒リスト */}
      {(showAll || searchQuery) && (
        <Card className="p-3">
          <div className="text-sm font-medium text-gray-600 mb-2">
            {searchQuery
              ? `検索結果 (${filteredStudents.length}名)`
              : `全生徒 (${mockStudents.length}名)`}
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {filteredStudents.map(student => {
                const isSelected = selectedStudents.some(s => s.id === student.id)
                return (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student)}
                    className={cn(
                      "w-full px-3 py-2 rounded text-left text-sm transition-colors flex items-center justify-between",
                      isSelected
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    )}
                    type="button"
                  >
                    <div>
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {student.furigana}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {student.class}
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                )
              })}
              {filteredStudents.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  該当する生徒が見つかりません
                </p>
              )}
            </div>
          </ScrollArea>
          {showAll && !searchQuery && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              type="button"
            >
              最近の生徒のみ表示
            </button>
          )}
        </Card>
      )}
    </div>
  )
}

// cn関数をインポートし忘れていたので追加
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}