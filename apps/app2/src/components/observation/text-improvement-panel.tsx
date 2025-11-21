// テキスト改善パネルコンポーネント
import { useState } from 'react'
import { FileText, Sparkles, List, Check, Edit2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface TextImprovementPanelProps {
  originalText?: string
  restructuredText?: string
  summary?: string
  onUseText: (text: string) => void
  isVisible: boolean
}

export function TextImprovementPanel({
  originalText,
  restructuredText,
  summary,
  onUseText,
  isVisible
}: TextImprovementPanelProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'improved' | 'summary'>('improved')
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')

  if (!isVisible || (!originalText && !restructuredText && !summary)) {
    return null
  }

  // 現在表示中のテキストを取得
  const getCurrentText = () => {
    switch (activeTab) {
      case 'original':
        return originalText || ''
      case 'improved':
        return restructuredText || originalText || ''
      case 'summary':
        return summary || ''
      default:
        return ''
    }
  }

  // テキストを使用
  const handleUseText = () => {
    const textToUse = isEditing ? editedText : getCurrentText()
    onUseText(textToUse)
    setIsEditing(false)
  }

  // 編集を開始
  const handleStartEdit = () => {
    setEditedText(getCurrentText())
    setIsEditing(true)
  }

  // タブのスタイルを取得
  const getTabStyle = (tab: 'original' | 'improved' | 'summary') => {
    return activeTab === tab
      ? 'bg-blue-500 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI テキスト改善</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            AI生成
          </Badge>
        </div>

        {/* タブボタン */}
        <div className="flex gap-2 mb-3">
          {originalText && (
            <button
              onClick={() => setActiveTab('original')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getTabStyle('original')}`}
              type="button"
            >
              <FileText className="h-3.5 w-3.5" />
              元のテキスト
            </button>
          )}
          {restructuredText && (
            <button
              onClick={() => setActiveTab('improved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getTabStyle('improved')}`}
              type="button"
            >
              <Sparkles className="h-3.5 w-3.5" />
              整形版
            </button>
          )}
          {summary && (
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getTabStyle('summary')}`}
              type="button"
            >
              <List className="h-3.5 w-3.5" />
              要約
            </button>
          )}
        </div>

        {/* テキスト表示エリア */}
        <div className="mb-3">
          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[100px] bg-white"
              placeholder="テキストを編集..."
            />
          ) : (
            <div className="p-3 bg-white rounded-md min-h-[100px]">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {getCurrentText()}
              </p>
            </div>
          )}
        </div>

        {/* タブごとの説明 */}
        {activeTab === 'improved' && restructuredText && (
          <div className="mb-3 text-xs text-blue-600">
            💡 AI改善ポイント: 句読点追加、文法修正、論理的な流れへの再構成
          </div>
        )}
        {activeTab === 'summary' && summary && (
          <div className="mb-3 text-xs text-blue-600">
            💡 要約: 重要なポイントを簡潔にまとめました
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleUseText}
                size="sm"
                variant="default"
              >
                <Check className="h-4 w-4 mr-1" />
                編集内容を使用
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                size="sm"
                variant="outline"
              >
                キャンセル
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleUseText}
                size="sm"
                variant="default"
              >
                <Check className="h-4 w-4 mr-1" />
                この内容を使用
              </Button>
              <Button
                onClick={handleStartEdit}
                size="sm"
                variant="outline"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                編集
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}