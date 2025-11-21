// テンプレートの型定義
import { TagCategory, PriorityLevel } from './observation'

export interface ObservationTemplate {
  id: string
  name: string
  description?: string
  category: TagCategory
  fields: TemplateField[]
  defaultPriority: PriorityLevel
  createdAt: number
  usageCount: number
}

export interface TemplateField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'student-select'
  placeholder?: string
  options?: string[]               // select時のオプション
  required: boolean
  defaultValue?: string
}