// タグカテゴリ定義
import type { TagCategory } from '@/types'

export interface CategoryInfo {
  id: TagCategory
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
  keywords: string[]
}

export const tagCategories: Record<TagCategory, CategoryInfo> = {
  behavioral: {
    id: 'behavioral',
    label: '行動',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'いじめ、暴力、孤立、反抗的態度など',
    icon: '👥',
    keywords: ['いじめ', '暴力', '孤立', '反抗', 'トラブル', '問題行動', '喧嘩'],
  },
  academic: {
    id: 'academic',
    label: '学習',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: '成績低下、宿題忘れ、授業不参加など',
    icon: '📚',
    keywords: ['成績', '宿題', '授業', '勉強', '学習', 'テスト', '提出物'],
  },
  health: {
    id: 'health',
    label: '健康',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: '体調不良、精神的不調、けがなど',
    icon: '🏥',
    keywords: ['体調', '病気', 'けが', '保健室', '精神', 'メンタル', '不調'],
  },
  family: {
    id: 'family',
    label: '家庭',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: '家庭環境の変化、保護者関連など',
    icon: '🏠',
    keywords: ['家庭', '保護者', '家族', '親', '兄弟', '家', '環境'],
  },
  social: {
    id: 'social',
    label: '人間関係',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: '友人関係、グループダイナミクスなど',
    icon: '🤝',
    keywords: ['友達', '友人', '仲間', 'グループ', '関係', '交流', 'コミュニケーション'],
  },
  emergency: {
    id: 'emergency',
    label: '緊急',
    color: 'text-red-900',
    bgColor: 'bg-red-200',
    description: '即座に対応が必要な深刻な状況',
    icon: '🚨',
    keywords: ['緊急', '自傷', '危険', '警察', '児相', '虐待', '深刻'],
  },
}

// カテゴリ色の取得
export function getCategoryColor(category: TagCategory): string {
  return tagCategories[category]?.bgColor || 'bg-gray-100'
}

// カテゴリラベルの取得
export function getCategoryLabel(category: TagCategory): string {
  return tagCategories[category]?.label || '未分類'
}

// 優先度の色定義
export const priorityColors = {
  urgent: {
    color: 'text-red-900',
    bgColor: 'bg-red-200',
    borderColor: 'border-red-300',
    label: '緊急',
  },
  high: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    label: '高',
  },
  normal: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    label: '通常',
  },
  low: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    label: '低',
  },
}