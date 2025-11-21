// 観察記録一覧コンポーネント
import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Clock, User, MapPin, AlertCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { ObservationRecord } from '@/types'
import { tagCategories, priorityColors } from '@/data/tag-categories'

interface ObservationListProps {
  observations: ObservationRecord[]
  onSelect?: (observation: ObservationRecord) => void
  selectedId?: string
}

export function ObservationList({
  observations,
  onSelect,
  selectedId,
}: ObservationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 記録の展開/折りたたみ
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (observations.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">観察記録がありません</p>
          <p className="text-sm mt-2">新しい記録を作成してください</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3" data-testid="observation-list">
      {observations.map((observation) => {
        const isExpanded = expandedId === observation.id
        const isSelected = selectedId === observation.id
        const priorityInfo = priorityColors[observation.priority]
        const typeInfo = tagCategories[observation.type]

        return (
          <Card
            key={observation.id}
            className={`transition-all ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
          >
            <CardContent className="p-4">
              {/* ヘッダー部分 */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleExpand(observation.id)}
              >
                <div className="flex-1">
                  {/* 優先度と日時 */}
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      variant="secondary"
                      className={`${priorityInfo.bgColor} ${priorityInfo.color} border-0`}
                    >
                      {priorityInfo.label}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(observation.timestamp), 'M月d日 (E)', { locale: ja })}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(observation.timestamp), 'HH:mm')}
                    </span>
                  </div>

                  {/* 生徒情報 */}
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {observation.students.map((student, index) => (
                        <span key={student.id} className="text-sm">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-gray-500">({student.class})</span>
                          {index < observation.students.length - 1 && '、'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 内容（最初の2行のみ表示） */}
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {observation.content.text}
                  </p>

                  {/* タグ */}
                  {observation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {observation.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag.label}
                        </Badge>
                      ))}
                      {observation.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{observation.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* 展開アイコン */}
                <div className="ml-3">
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {/* 展開時の詳細情報 */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {/* カテゴリと場所 */}
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className={`${typeInfo.bgColor} ${typeInfo.color} border-0`}
                    >
                      {typeInfo.icon} {typeInfo.label}
                    </Badge>
                    {observation.location && (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {observation.location}
                      </span>
                    )}
                  </div>

                  {/* 内容全文 */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">観察内容:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {observation.content.text}
                    </p>
                  </div>

                  {/* AI分析結果 */}
                  {observation.aiAnalysis && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        AI分析結果
                      </p>
                      {observation.aiAnalysis.suggestedActions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-blue-800">
                            推奨アクション:
                          </p>
                          <ul className="text-xs text-blue-700 list-disc list-inside">
                            {observation.aiAnalysis.suggestedActions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* アクションボタン */}
                  {onSelect && (
                    <div className="flex justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(observation)
                        }}
                        size="sm"
                      >
                        詳細を表示
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}