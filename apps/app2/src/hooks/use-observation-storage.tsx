// 観察記録ストレージのカスタムフック
import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ObservationRecord, Student } from '@/types'
import * as db from '@/lib/storage/indexeddb'

export function useObservationStorage() {
  const [observations, setObservations] = useState<ObservationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 全観察記録を読み込み
  const loadObservations = useCallback(async () => {
    try {
      setLoading(true)
      const records = await db.getAllObservations()
      setObservations(records)
      setError(null)
    } catch (err) {
      console.error('Failed to load observations:', err)
      setError('観察記録の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初期読み込み
  useEffect(() => {
    loadObservations()
  }, [loadObservations])

  // 観察記録を作成
  const createObservation = useCallback(async (
    data: Omit<ObservationRecord, 'id' | 'timestamp' | 'lastModified'>
  ): Promise<ObservationRecord | null> => {
    try {
      const newRecord: ObservationRecord = {
        ...data,
        id: uuidv4(),
        timestamp: Date.now(),
        lastModified: Date.now(),
      }

      await db.saveObservation(newRecord)

      // ステートを更新
      setObservations(prev => [newRecord, ...prev])

      return newRecord
    } catch (err) {
      console.error('Failed to create observation:', err)
      setError('観察記録の作成に失敗しました')
      return null
    }
  }, [])

  // 観察記録を更新
  const updateObservation = useCallback(async (
    id: string,
    updates: Partial<ObservationRecord>
  ): Promise<boolean> => {
    try {
      await db.updateObservation(id, updates)

      // ステートを更新
      setObservations(prev =>
        prev.map(obs =>
          obs.id === id
            ? { ...obs, ...updates, lastModified: Date.now() }
            : obs
        )
      )

      return true
    } catch (err) {
      console.error('Failed to update observation:', err)
      setError('観察記録の更新に失敗しました')
      return false
    }
  }, [])

  // 観察記録を削除
  const deleteObservation = useCallback(async (id: string): Promise<boolean> => {
    try {
      await db.deleteObservation(id)

      // ステートを更新
      setObservations(prev => prev.filter(obs => obs.id !== id))

      return true
    } catch (err) {
      console.error('Failed to delete observation:', err)
      setError('観察記録の削除に失敗しました')
      return false
    }
  }, [])

  // 生徒別の観察記録を取得
  const getStudentObservations = useCallback(async (
    studentId: string
  ): Promise<ObservationRecord[]> => {
    try {
      return await db.getObservationsByStudent(studentId)
    } catch (err) {
      console.error('Failed to get student observations:', err)
      return []
    }
  }, [])

  // 優先度別の観察記録を取得
  const getPriorityObservations = useCallback(async (
    priority: string
  ): Promise<ObservationRecord[]> => {
    try {
      return await db.getObservationsByPriority(priority)
    } catch (err) {
      console.error('Failed to get priority observations:', err)
      return []
    }
  }, [])

  // 期間別の観察記録を取得
  const getDateRangeObservations = useCallback(async (
    startDate: Date,
    endDate: Date
  ): Promise<ObservationRecord[]> => {
    try {
      return await db.getObservationsByDateRange(
        startDate.getTime(),
        endDate.getTime()
      )
    } catch (err) {
      console.error('Failed to get date range observations:', err)
      return []
    }
  }, [])

  // 音声を保存
  const saveAudio = useCallback(async (
    audioBlob: Blob
  ): Promise<string | null> => {
    try {
      const audioId = uuidv4()
      await db.saveAudioBlob(audioId, audioBlob)
      return audioId
    } catch (err) {
      console.error('Failed to save audio:', err)
      setError('音声の保存に失敗しました')
      return null
    }
  }, [])

  // 音声を取得
  const getAudio = useCallback(async (audioId: string): Promise<Blob | null> => {
    try {
      const blob = await db.getAudioBlob(audioId)
      return blob || null
    } catch (err) {
      console.error('Failed to get audio:', err)
      return null
    }
  }, [])

  // 統計情報を取得
  const getStatistics = useCallback(async () => {
    try {
      return await db.getStatistics()
    } catch (err) {
      console.error('Failed to get statistics:', err)
      return null
    }
  }, [])

  // 検索機能
  const searchObservations = useCallback((query: string): ObservationRecord[] => {
    if (!query) return observations

    const lowerQuery = query.toLowerCase()
    return observations.filter(obs => {
      // テキスト内容で検索
      if (obs.content.text.toLowerCase().includes(lowerQuery)) return true

      // 生徒名で検索
      if (obs.students.some(s =>
        s.name.toLowerCase().includes(lowerQuery)
      )) return true

      // タグで検索
      if (obs.tags.some(tag =>
        tag.label.toLowerCase().includes(lowerQuery)
      )) return true

      // 場所で検索
      if (obs.location?.toLowerCase().includes(lowerQuery)) return true

      return false
    })
  }, [observations])

  return {
    observations,
    loading,
    error,
    createObservation,
    updateObservation,
    deleteObservation,
    getStudentObservations,
    getPriorityObservations,
    getDateRangeObservations,
    saveAudio,
    getAudio,
    getStatistics,
    searchObservations,
    refresh: loadObservations,
  }
}