# App 2: 教員情報入力システム

## 概要

教員が移動中や授業間の短い時間でも、簡単に生徒の観察記録を入力できるモバイルファーストのアプリケーションです。音声入力を中心に、教員の負担を最小限に抑えながら重要な情報を記録します。

### 開発ステータス
- **フェーズ**: 設計・計画中
- **優先度**: 高（Phase 2で実装予定）
- **想定開発期間**: 3-4週間

## コンセプト

### 解決する課題
- 📝 紙の記録による時間ロス
- 🚶 移動中の観察記録の困難さ
- 💭 重要な気づきの記録漏れ
- ⏰ 事務作業による残業時間増加

### 提供価値
- 🎤 30秒で観察記録完了
- 📱 スマホで簡単入力
- 🏷️ 自動タグ付けで整理不要
- 🔄 他システムとの自動連携

## 主要機能

### 1. 音声入力機能

#### クイック音声メモ
```typescript
interface VoiceMemo {
  // ワンタップで録音開始
  startRecording(): void;

  // 自動文字起こし
  transcribe(audio: Blob): Promise<string>;

  // キーワード抽出
  extractKeywords(text: string): string[];

  // 自動分類
  categorize(text: string): ObservationCategory;
}
```

#### 音声コマンド対応
```
「生徒A、要注意、部活でトラブル」
→ 自動的に構造化データに変換
```

### 2. スマート入力アシスト

#### 予測変換
- 生徒名の自動補完
- よく使うフレーズの提案
- 過去の記録からの学習

#### テンプレート機能
```typescript
const templates = [
  {
    name: "行動観察",
    fields: ["生徒名", "場所", "行動", "対応"]
  },
  {
    name: "学習状況",
    fields: ["生徒名", "科目", "理解度", "特記事項"]
  },
  {
    name: "トラブル報告",
    fields: ["関係者", "概要", "対応", "要フォロー"]
  }
];
```

### 3. 自動タグ付けシステム

#### タグ分類
```typescript
enum TagCategory {
  BEHAVIORAL = "行動",      // いじめ、暴力、孤立
  ACADEMIC = "学習",        // 成績低下、宿題忘れ
  HEALTH = "健康",          // 体調不良、精神的不調
  FAMILY = "家庭",          // 家庭環境、保護者関連
  SOCIAL = "人間関係",      // 友人関係、グループ dynamics
  EMERGENCY = "緊急"        // 即時対応必要
}
```

#### AI自動タグ付け
```typescript
async function autoTag(observation: string): Promise<Tag[]> {
  const analysis = await analyzeText(observation);
  return [
    ...extractStudentNames(observation),
    ...detectKeywords(observation),
    ...inferContext(analysis),
    ...assessPriority(analysis)
  ];
}
```

## ユーザーインターフェース設計

### 画面構成

#### メイン画面（観察入力）
```
┌─────────────────────────────────────┐
│  📝 観察記録     [≡] メニュー        │
├─────────────────────────────────────┤
│                                      │
│  最近の生徒 [A] [B] [C] [D] [+]     │
│                                      │
│  ┌─────────────────────────────┐    │
│  │                              │    │
│  │   [🎤 長押しで録音]         │    │
│  │                              │    │
│  └─────────────────────────────┘    │
│                                      │
│  または                              │
│                                      │
│  [📷 写真] [📝 テキスト] [📋 定型]  │
│                                      │
│  ─────────────────────────────      │
│                                      │
│  最近の記録                         │
│  • 10:30 生徒B 部活でのトラブル     │
│  • 09:15 生徒A 授業中の居眠り       │
│  • 昨日  生徒C 提出物遅れ           │
│                                      │
└─────────────────────────────────────┘
```

#### 音声入力中画面
```
┌─────────────────────────────────────┐
│         🎤 録音中...                 │
├─────────────────────────────────────┤
│                                      │
│      ●━━━━━━━━━━━━━━━━━━           │
│         0:05 / 0:30                  │
│                                      │
│  「生徒Bが休み時間に一人で        」│
│  「泣いていました。Cくんとの      」│
│  「トラブルが原因のようです...    」│
│                                      │
│         [一時停止] [完了]            │
│                                      │
└─────────────────────────────────────┘
```

### レスポンシブデザイン

| デバイス | 最適化内容 |
|---------|-----------|
| スマートフォン | 片手操作可能なUI配置 |
| タブレット | 分割画面対応、詳細入力 |
| デスクトップ | キーボードショートカット |

## データモデル

### 観察記録スキーマ

```typescript
interface ObservationRecord {
  id: string;
  teacherId: string;
  timestamp: Date;

  // 基本情報
  students: StudentReference[];
  location?: Location;

  // 内容
  type: ObservationType;
  content: {
    text: string;
    voice?: AudioFile;
    images?: ImageFile[];
  };

  // 分析結果
  tags: Tag[];
  priority: Priority;
  sentiment: SentimentAnalysis;

  // メタデータ
  device: DeviceInfo;
  inputMethod: 'voice' | 'text' | 'template';
  processingTime: number;
}

interface StudentReference {
  id: string;
  name: string;
  class: string;
  role: 'subject' | 'related' | 'witness';
}
```

### プライオリティ判定ロジック

```typescript
function calculatePriority(record: ObservationRecord): Priority {
  const factors = {
    keywords: checkUrgentKeywords(record.content.text),
    sentiment: record.sentiment.score,
    frequency: getRecentRecordCount(record.students),
    pattern: detectPattern(record)
  };

  if (factors.keywords.includes('緊急') ||
      factors.sentiment < -0.8) {
    return Priority.URGENT;
  }

  if (factors.frequency > 3 ||
      factors.pattern === 'escalating') {
    return Priority.HIGH;
  }

  return Priority.NORMAL;
}
```

## API設計

### RESTful API

#### 観察記録の作成
```yaml
POST /api/v1/observations
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Request:
  {
    "students": ["student_id_1"],
    "content": "休み時間に一人で泣いていた",
    "type": "behavioral",
    "location": "classroom"
  }

Response:
  {
    "id": "obs_123456",
    "status": "processed",
    "tags": ["要注意", "メンタルケア", "生徒B"],
    "priority": "high",
    "suggestedActions": [
      "個別面談の実施",
      "カウンセラーへの相談"
    ]
  }
```

#### 音声アップロード
```yaml
POST /api/v1/observations/voice
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Request:
  audio: <audio_file>
  metadata: {
    "duration": 15,
    "format": "webm"
  }

Response:
  {
    "id": "obs_123457",
    "transcription": "生徒Aが最近元気がない",
    "status": "transcribed",
    "confidence": 0.95
  }
```

### WebSocket（リアルタイム通知）

```typescript
// WebSocket接続
const ws = new WebSocket('wss://api.example.com/ws');

// 緊急アラート受信
ws.on('urgent_alert', (data) => {
  showNotification({
    title: '緊急確認',
    body: data.message,
    action: data.suggestedAction
  });
});
```

## セキュリティ＆プライバシー

### 認証・認可

```typescript
// JWT認証フロー
class AuthService {
  async login(credentials: Credentials): Promise<AuthToken> {
    // 学校の認証サーバーと連携
    const schoolAuth = await validateWithSchool(credentials);

    // JWTトークン生成
    return generateJWT({
      teacherId: schoolAuth.id,
      schools: schoolAuth.schools,
      classes: schoolAuth.classes,
      permissions: schoolAuth.permissions
    });
  }

  // トークンリフレッシュ
  async refresh(token: string): Promise<AuthToken> {
    // 短時間トークンで安全性向上
    return refreshToken(token);
  }
}
```

### データ保護

1. **暗号化**
   - 通信: TLS 1.3必須
   - 保存: AES-256で暗号化
   - 音声: エンドツーエンド暗号化

2. **アクセス制御**
   - 担当クラスの生徒のみアクセス可
   - 管理職は全体サマリーのみ
   - 監査ログの完全記録

## オフライン対応

### Progressive Web App（PWA）実装

```typescript
// Service Worker でオフライン対応
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあればそれを返す
      if (response) return response;

      // なければネットワークから取得
      return fetch(event.request).then((response) => {
        // 重要なリソースはキャッシュに保存
        if (shouldCache(event.request)) {
          caches.open('v1').then((cache) => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
```

### ローカルストレージ同期

```typescript
class OfflineSync {
  // オフライン時はIndexedDBに保存
  async saveObservation(data: ObservationRecord): Promise<void> {
    if (navigator.onLine) {
      await api.post('/observations', data);
    } else {
      await indexedDB.save('pending_observations', data);
      scheduleSync();
    }
  }

  // オンライン復帰時に同期
  async syncPendingData(): Promise<void> {
    const pending = await indexedDB.getAll('pending_observations');
    for (const observation of pending) {
      await api.post('/observations', observation);
      await indexedDB.delete('pending_observations', observation.id);
    }
  }
}
```

## パフォーマンス目標

| メトリクス | 目標値 | 測定方法 |
|-----------|--------|---------|
| 音声入力開始時間 | < 0.5秒 | タップから録音開始まで |
| 文字起こし時間 | < 2秒/10秒音声 | 音声処理完了まで |
| 画面遷移 | < 100ms | 画面切り替え時間 |
| オフライン起動 | < 2秒 | PWA起動時間 |

## 開発ロードマップ

### Phase 2.1（Week 1-2）
- [ ] 基本UI実装
- [ ] 音声録音機能
- [ ] テキスト入力
- [ ] 生徒選択UI

### Phase 2.2（Week 3）
- [ ] 音声認識API統合
- [ ] 自動タグ付け
- [ ] プライオリティ判定
- [ ] データ同期基盤

### Phase 2.3（Week 4）
- [ ] PWA対応
- [ ] オフライン機能
- [ ] プッシュ通知
- [ ] セキュリティ実装

## テスト計画

### ユニットテスト
```typescript
describe('ObservationService', () => {
  it('should transcribe voice correctly', async () => {
    const audio = loadTestAudio('sample.webm');
    const result = await service.transcribe(audio);
    expect(result.text).toContain('生徒A');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should extract tags from text', () => {
    const tags = service.extractTags('いじめの可能性');
    expect(tags).toContain('緊急');
    expect(tags).toContain('要確認');
  });
});
```

### 統合テスト
- 音声入力→タグ付け→保存の一連フロー
- オフライン→オンライン同期
- 複数デバイスでのデータ整合性

## サポート＆運用

### モニタリング項目
- API応答時間
- 音声認識精度
- エラー率
- 使用頻度統計

### ユーザーサポート
- アプリ内ヘルプ
- 動画チュートリアル
- FAQセクション
- 問い合わせフォーム