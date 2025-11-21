// 生徒情報の型定義

export interface Student {
  id: string
  name: string
  furigana: string                 // ふりがな
  class: string                    // クラス名（例: "3年A組"）
  studentNumber: number
  recentObservationCount?: number  // 最近の観察記録数
  profilePictureUrl?: string       // プロフィール画像URL（オプション）
}