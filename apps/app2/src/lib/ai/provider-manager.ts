// AIプロバイダー管理システム
// 複数のAIプロバイダー間でのフォールバック処理を管理

import { toast } from 'sonner'
import type { TagAnalysisResponse } from './llama-api'
import { callLlamaAPI, createAnalysisPrompt, getStructuredResponse } from './llama-api'
import { callOllamaAPI, createOllamaAnalysisPrompt, parseOllamaResponse, checkOllamaAvailability } from './ollama-api'
import { generateMockAnalysis } from './tag-analyzer'

// プロバイダーの種類
export type AIProvider = 'sambanova' | 'ollama' | 'mock'

// プロバイダーの実行結果
interface ProviderResult {
  success: boolean
  provider: AIProvider
  data?: TagAnalysisResponse
  error?: string
}

// AIプロバイダーマネージャー
export class AIProviderManager {
  private static instance: AIProviderManager
  private ollamaAvailable: boolean = false
  private lastCheckTime: number = 0
  private readonly checkInterval = 60000 // 1分間隔でOllamaの可用性を再チェック

  private constructor() {}

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager()
    }
    return AIProviderManager.instance
  }

  // Ollamaの可用性を定期的にチェック
  private async updateOllamaAvailability(): Promise<boolean> {
    const now = Date.now()
    if (now - this.lastCheckTime > this.checkInterval) {
      this.ollamaAvailable = await checkOllamaAvailability()
      this.lastCheckTime = now
      if (this.ollamaAvailable) {
        console.log('Ollama is available for fallback')
      }
    }
    return this.ollamaAvailable
  }

  // SambaNovaで分析を実行
  private async trySambaNova(
    observationText: string,
    studentNames?: string[],
    location?: string
  ): Promise<ProviderResult> {
    try {
      const messages = createAnalysisPrompt(observationText, studentNames, location)
      const response = await getStructuredResponse(messages)

      if (response) {
        return {
          success: true,
          provider: 'sambanova',
          data: response
        }
      }

      return {
        success: false,
        provider: 'sambanova',
        error: 'No response from SambaNova'
      }
    } catch (error: any) {
      // ネットワークエラーまたは認証エラーの場合はフォールバック
      if (error.message?.includes('Failed to fetch') ||
          error.message?.includes('401') ||
          error.message?.includes('403') ||
          error.message?.includes('VITE_LLAMA_API_KEY')) {
        return {
          success: false,
          provider: 'sambanova',
          error: error.message
        }
      }

      // その他のエラーも記録
      return {
        success: false,
        provider: 'sambanova',
        error: error.message || 'Unknown error'
      }
    }
  }

  // Ollamaで分析を実行
  private async tryOllama(
    observationText: string,
    studentNames?: string[],
    location?: string
  ): Promise<ProviderResult> {
    try {
      // Ollamaの可用性をチェック
      const available = await this.updateOllamaAvailability()
      if (!available) {
        return {
          success: false,
          provider: 'ollama',
          error: 'Ollama is not available'
        }
      }

      const prompt = createOllamaAnalysisPrompt(observationText, studentNames, location)
      const response = await callOllamaAPI(prompt)

      if (response) {
        const parsed = parseOllamaResponse(response)
        if (parsed) {
          // Ollamaのレスポンスを正規化
          const normalizedResponse: TagAnalysisResponse = {
            tags: parsed.tags || [],
            priority: parsed.priority || 'normal',
            type: parsed.type || 'behavioral',
            location: parsed.location || location,
            sentiment: parsed.sentiment ?? 0,
            keywords: parsed.keywords || [],
            suggestedActions: parsed.suggestedActions || [],
            confidence: parsed.confidence ?? 0.7
          }

          return {
            success: true,
            provider: 'ollama',
            data: normalizedResponse
          }
        }
      }

      return {
        success: false,
        provider: 'ollama',
        error: 'Failed to parse Ollama response'
      }
    } catch (error: any) {
      return {
        success: false,
        provider: 'ollama',
        error: error.message || 'Unknown Ollama error'
      }
    }
  }

  // モック分析を使用
  private useMockAnalysis(
    observationText: string,
    studentNames?: string[],
    location?: string
  ): ProviderResult {
    const mockResult = generateMockAnalysis(observationText)

    // モック分析結果をTagAnalysisResponse形式に変換
    const response: TagAnalysisResponse = {
      tags: mockResult.tags.map(tag => ({
        label: tag.label,
        category: tag.category
      })),
      priority: mockResult.priority,
      type: mockResult.type,
      location: mockResult.location || location,
      sentiment: mockResult.aiAnalysis.sentiment,
      keywords: mockResult.aiAnalysis.keywords,
      suggestedActions: mockResult.aiAnalysis.suggestedActions,
      confidence: mockResult.aiAnalysis.confidence
    }

    return {
      success: true,
      provider: 'mock',
      data: response
    }
  }

  // カスケード方式でAI分析を実行
  public async analyzeWithFallback(
    observationText: string,
    studentNames?: string[],
    location?: string
  ): Promise<TagAnalysisResponse | null> {
    console.log('Starting AI analysis with fallback...')

    // 1. SambaNovaを試行
    const sambaResult = await this.trySambaNova(observationText, studentNames, location)
    if (sambaResult.success && sambaResult.data) {
      console.log('Analysis succeeded with SambaNova')
      return sambaResult.data
    }
    console.log('SambaNova failed:', sambaResult.error)

    // 2. Ollamaへフォールバック
    const ollamaResult = await this.tryOllama(observationText, studentNames, location)
    if (ollamaResult.success && ollamaResult.data) {
      console.log('Analysis succeeded with Ollama (local)')
      toast.info('ローカルAIを使用して分析しました', {
        description: 'Ollamaモデルで観察記録を分析しました'
      })
      return ollamaResult.data
    }
    console.log('Ollama failed:', ollamaResult.error)

    // 3. モック分析へフォールバック
    console.log('Falling back to mock analysis')
    const mockResult = this.useMockAnalysis(observationText, studentNames, location)

    toast.warning('簡易分析モードを使用しました', {
      description: 'AI接続エラーのため、基本的なキーワード分析を実行しました'
    })

    return mockResult.data || null
  }

  // プロバイダーのステータスを取得
  public async getProvidersStatus(): Promise<{
    sambanova: boolean
    ollama: boolean
  }> {
    const ollamaAvailable = await this.updateOllamaAvailability()

    // SambaNovaはAPIキーの有無で判定
    const sambaNovaAvailable = !!import.meta.env.VITE_LLAMA_API_KEY

    return {
      sambanova: sambaNovaAvailable,
      ollama: ollamaAvailable
    }
  }
}