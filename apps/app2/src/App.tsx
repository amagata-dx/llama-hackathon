// メインアプリケーションコンポーネント
import { useState, useCallback } from 'react'
import { Toaster, toast } from 'sonner'
import { ObservationForm, type ObservationFormData } from '@/components/observation/observation-form'
import { ObservationList } from '@/components/observation/observation-list'
import { useObservationStorage } from '@/hooks/use-observation-storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, FileText, BarChart3, RefreshCw } from 'lucide-react'
import type { ObservationRecord } from '@/types'

function App() {
  const {
    observations,
    loading,
    error,
    createObservation,
    searchObservations,
    getStatistics,
    refresh,
  } = useObservationStorage()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedObservation, setSelectedObservation] = useState<ObservationRecord | null>(null)
  const [statistics, setStatistics] = useState<any>(null)

  // 観察記録の作成
  const handleSubmit = useCallback(async (formData: ObservationFormData) => {
    setIsSubmitting(true)
    try {
      const newObservation = await createObservation(formData)
      if (newObservation) {
        toast.success('観察記録を保存しました', {
          description: `${formData.students.map(s => s.name).join('、')} の記録を作成しました`,
        })
      } else {
        toast.error('保存に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create observation:', error)
      toast.error('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }, [createObservation])

  // 統計情報の取得
  const loadStatistics = useCallback(async () => {
    const stats = await getStatistics()
    setStatistics(stats)
  }, [getStatistics])

  // 検索結果
  const filteredObservations = searchQuery
    ? searchObservations(searchQuery)
    : observations

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                教員観察記録システム
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  refresh()
                  loadStatistics()
                }}
                variant="ghost"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                更新
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* エラー表示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム: フォーム */}
          <div className="lg:col-span-1">
            <ObservationForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />

            {/* 統計情報 */}
            {statistics && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    統計情報
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">総記録数:</span>
                      <span className="font-medium">{statistics.totalRecords}件</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">過去7日間:</span>
                      <span className="font-medium">{statistics.recentCount}件</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-gray-600 mb-2">優先度別:</p>
                      <div className="space-y-1">
                        {Object.entries(statistics.byPriority).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500">{key}:</span>
                            <span>{value}件</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右カラム: 一覧 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>観察記録一覧</CardTitle>
                  <Badge variant="secondary">
                    {filteredObservations.length} 件
                  </Badge>
                </div>
                {/* 検索ボックス */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="生徒名、内容、タグで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="search-input"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <ObservationList
                    observations={filteredObservations}
                    onSelect={setSelectedObservation}
                    selectedId={selectedObservation?.id}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// ScrollAreaコンポーネントの簡易版（既存のものを使用すべき）
function ScrollArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-auto ${className}`}>
      {children}
    </div>
  )
}

export default App