# 教員AIサポートシステム ドキュメント

## プロジェクト概要

本プロジェクトは、教員の長時間労働という社会課題をAIエージェント群で解決するハッカソンプロジェクトです。

### ミッション
「教員が生徒と向き合う時間を創出し、教育の質を向上させる」

### ビジョン
AIエージェントによる情報収集・分析・支援により、教員の業務を効率化し、残業時間を30%削減する。

## 📚 ドキュメント構成

### 🎯 コンセプト＆シナリオ
- [SCENARIO.md](./SCENARIO.md) - ハッカソンデモシナリオと価値提案
- [ARCHITECTURE.md](./ARCHITECTURE.md) - システムアーキテクチャと技術設計

### 🚀 アプリケーション仕様

#### App 1: 生徒対話エージェント
- [概要とコンセプト](./apps/app1-student-dialogue/README.md)
- **現在のステータス**: 実装済み（基本機能）
- **主要機能**: 音声対話、3Dアバター、感情分析

#### App 2: 教員情報入力システム
- [概要と設計](./apps/app2-teacher-input/README.md)
- **現在のステータス**: 設計フェーズ
- **主要機能**: 音声入力、自動タグ付け、モバイル対応

#### App 3: 情報統合＆アラートAI
- [概要と処理ロジック](./apps/app3-integration-alert/README.md)
- **現在のステータス**: 設計フェーズ
- **主要機能**: 情報統合、リスク分析、アラート生成

#### App 4: モニタリング＆サポートAI
- [概要とダッシュボード設計](./apps/app4-monitoring-support/README.md)
- **現在のステータス**: 設計フェーズ
- **主要機能**: 継続モニタリング、介入支援、レポート作成

## 🛠 技術スタック

### フロントエンド
- **Framework**: React 19.2.0 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **3D Graphics**: Three.js

### AI/LLM
- **LLM Provider**: SambaNova AI
- **Model**: Llama-4-Maverick-17B-128E-Instruct
- **Speech**: Web Speech Recognition API

### バックエンド（計画中）
- **API Server**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL
- **Auth**: JWT/OAuth2
- **Real-time**: WebSocket

## 📊 期待される成果

### 定量的効果
- 教員の残業時間：**30%削減**
- 事務作業時間：**50%削減**
- トラブル早期発見率：**200%向上**

### 定性的効果
- 教員のストレス軽減
- 生徒への個別対応の質向上
- 学級運営の安定化

## 🚦 開発ロードマップ

| Phase | 内容 | ステータス |
|-------|------|-----------|
| Phase 1 | 生徒対話エージェント基本実装 | ✅ 完了 |
| Phase 2 | 教員用情報入力アプリ開発 | 🚧 進行中 |
| Phase 3 | 情報統合・アラートシステム構築 | 📋 計画中 |
| Phase 4 | モニタリング・サポート機能追加 | 📋 計画中 |
| Phase 5 | 全アプリ連携とフィールドテスト | 📋 計画中 |

## 🎮 デモ環境

### ローカル環境での起動

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで開く
open http://localhost:5173
```

### 環境設定

`.env`ファイルを作成し、以下を設定:

```env
VITE_LLAMA_API_KEY=your_sambanova_api_key_here
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエスト歓迎です。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📧 お問い合わせ

プロジェクトに関する質問は、GitHubのIssueでお願いします。