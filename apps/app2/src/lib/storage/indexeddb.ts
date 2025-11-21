// IndexedDB ストレージ層
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { ObservationRecord } from '@/types'

interface ObservationDB extends DBSchema {
  observations: {
    key: string
    value: ObservationRecord
    indexes: {
      'by-timestamp': number
      'by-priority': string
      'by-student': string
    }
  }
  audioBlobs: {
    key: string
    value: {
      id: string
      blob: Blob
      timestamp: number
    }
  }
}

const DB_NAME = 'teacher-observation-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<ObservationDB> | null = null

async function getDB(): Promise<IDBPDatabase<ObservationDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<ObservationDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // observations store
      if (!db.objectStoreNames.contains('observations')) {
        const obsStore = db.createObjectStore('observations', { keyPath: 'id' })
        obsStore.createIndex('by-timestamp', 'timestamp')
        obsStore.createIndex('by-priority', 'priority')
        obsStore.createIndex('by-student', 'students.id', { multiEntry: true })
      }

      // audioBlobs store
      if (!db.objectStoreNames.contains('audioBlobs')) {
        db.createObjectStore('audioBlobs', { keyPath: 'id' })
      }
    }
  })

  return dbInstance
}

// 観察記録の保存
export async function saveObservation(record: ObservationRecord): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('observations', 'readwrite')
  await tx.store.put(record)
  await tx.done
}

// 観察記録の取得（単一）
export async function getObservation(id: string): Promise<ObservationRecord | undefined> {
  const db = await getDB()
  return await db.get('observations', id)
}

// 全観察記録の取得
export async function getAllObservations(): Promise<ObservationRecord[]> {
  const db = await getDB()
  const records = await db.getAll('observations')
  // 新しい順にソート
  return records.sort((a, b) => b.timestamp - a.timestamp)
}

// 優先度別の観察記録取得
export async function getObservationsByPriority(priority: string): Promise<ObservationRecord[]> {
  const db = await getDB()
  const records = await db.getAllFromIndex('observations', 'by-priority', priority)
  return records.sort((a, b) => b.timestamp - a.timestamp)
}

// 生徒別の観察記録取得
export async function getObservationsByStudent(studentId: string): Promise<ObservationRecord[]> {
  const db = await getDB()
  const allRecords = await db.getAll('observations')
  // 生徒IDでフィルタリング
  const filtered = allRecords.filter(record =>
    record.students.some(student => student.id === studentId)
  )
  return filtered.sort((a, b) => b.timestamp - a.timestamp)
}

// 期間別の観察記録取得
export async function getObservationsByDateRange(
  startDate: number,
  endDate: number
): Promise<ObservationRecord[]> {
  const db = await getDB()
  const allRecords = await db.getAll('observations')
  const filtered = allRecords.filter(
    record => record.timestamp >= startDate && record.timestamp <= endDate
  )
  return filtered.sort((a, b) => b.timestamp - a.timestamp)
}

// 観察記録の削除
export async function deleteObservation(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('observations', id)
}

// 観察記録の更新
export async function updateObservation(
  id: string,
  updates: Partial<ObservationRecord>
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('observations', id)
  if (existing) {
    const updated = {
      ...existing,
      ...updates,
      lastModified: Date.now()
    }
    await db.put('observations', updated)
  }
}

// 音声Blobの保存
export async function saveAudioBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB()
  await db.put('audioBlobs', {
    id,
    blob,
    timestamp: Date.now()
  })
}

// 音声Blobの取得
export async function getAudioBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB()
  const record = await db.get('audioBlobs', id)
  return record?.blob
}

// 音声Blobの削除
export async function deleteAudioBlob(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('audioBlobs', id)
}

// データベースのクリア（開発・テスト用）
export async function clearDatabase(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['observations', 'audioBlobs'], 'readwrite')
  await tx.objectStore('observations').clear()
  await tx.objectStore('audioBlobs').clear()
  await tx.done
}

// 統計情報の取得
export async function getStatistics() {
  const db = await getDB()
  const records = await db.getAll('observations')

  const stats = {
    totalRecords: records.length,
    byPriority: {
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0
    },
    byType: {} as Record<string, number>,
    recentDays: 7,
    recentCount: 0
  }

  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)

  records.forEach(record => {
    // 優先度別カウント
    stats.byPriority[record.priority]++

    // タイプ別カウント
    if (record.type) {
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1
    }

    // 最近の記録カウント
    if (record.timestamp >= sevenDaysAgo) {
      stats.recentCount++
    }
  })

  return stats
}