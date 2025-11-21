# App 4: モニタリング＆サポートエージェント

## 概要

継続的な生徒モニタリング、介入後のフォローアップ、レポート生成を自動化し、教員の負担を軽減しながら生徒サポートの質を向上させるAIエージェントシステムです。

### 開発ステータス
- **フェーズ**: 設計・計画中
- **優先度**: 中（Phase 4で実装予定）
- **前提条件**: App 1-3の稼働

## システムの価値提案

### 解決する課題
- 📋 手書き報告書作成の負担
- 🔄 フォローアップの忘れ・漏れ
- 📊 データに基づく判断の困難さ
- ⏰ 管理業務による時間圧迫

### 提供機能
- 🎯 自動モニタリングとリマインダー
- 📈 視覚的なダッシュボード
- 📝 レポート自動生成
- 💡 データドリブンな介入提案

## 主要機能

### 1. インテリジェントダッシュボード

#### ダッシュボード構成
```typescript
interface DashboardView {
  overview: {
    // クラス全体の状況
    classHealth: {
      score: number;           // 0-100
      trend: 'up' | 'stable' | 'down';
      alerts: AlertSummary[];
      recommendations: string[];
    };

    // 要注意生徒リスト
    watchList: {
      students: StudentWatch[];
      newAdditions: Student[];
      resolved: Student[];
    };

    // 今日のタスク
    todayTasks: {
      urgent: Task[];
      followUps: FollowUp[];
      meetings: Meeting[];
      reports: ReportDue[];
    };
  };

  // 個別生徒ビュー
  studentDetail: {
    profile: StudentProfile;
    timeline: Event[];
    interventions: Intervention[];
    progress: ProgressChart;
    nextSteps: Action[];
  };

  // 分析ビュー
  analytics: {
    trends: TrendAnalysis;
    patterns: PatternInsights;
    predictions: FuturePredictions;
    comparisons: ClassComparison;
  };
}
```

#### ビジュアライゼーション例

```tsx
// クラスヒートマップコンポーネント
const ClassHeatmap: React.FC = () => {
  return (
    <div className="grid grid-cols-7 gap-1">
      {students.map(student => (
        <div
          key={student.id}
          className={`p-2 rounded ${getRiskColor(student.riskScore)}`}
          title={`${student.name}: リスクスコア ${student.riskScore}`}
        >
          <Avatar src={student.avatar} />
          <span className="text-xs">{student.initials}</span>
          {student.hasAlert && <AlertIcon />}
        </div>
      ))}
    </div>
  );
};

// リスクトレンドグラフ
const RiskTrendChart: React.FC = () => {
  const data = useRiskTrendData();

  return (
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis label="リスクスコア" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="class" stroke="#8884d8" />
      <Line type="monotone" dataKey="individual" stroke="#82ca9d" />
    </LineChart>
  );
};
```

### 2. 自動フォローアップシステム

#### フォローアップエンジン
```typescript
class FollowUpEngine {
  private scheduler: TaskScheduler;
  private notifier: NotificationService;

  async createFollowUpPlan(intervention: Intervention): Promise<FollowUpPlan> {
    const plan = {
      id: generateId(),
      interventionId: intervention.id,
      checkpoints: this.generateCheckpoints(intervention),
      metrics: this.defineMetrics(intervention),
      escalation: this.createEscalationPath(intervention)
    };

    // スケジュール登録
    for (const checkpoint of plan.checkpoints) {
      await this.scheduler.schedule({
        taskId: checkpoint.id,
        executionTime: checkpoint.scheduledDate,
        action: () => this.executeCheckpoint(checkpoint)
      });
    }

    return plan;
  }

  private generateCheckpoints(intervention: Intervention): Checkpoint[] {
    // 介入タイプに応じたチェックポイント生成
    switch (intervention.type) {
      case 'bullying_prevention':
        return [
          { days: 1, action: 'immediate_check', priority: 'high' },
          { days: 3, action: 'situation_assessment', priority: 'high' },
          { days: 7, action: 'progress_review', priority: 'medium' },
          { days: 14, action: 'final_evaluation', priority: 'medium' }
        ];

      case 'academic_support':
        return [
          { days: 7, action: 'initial_progress', priority: 'medium' },
          { days: 14, action: 'mid_term_review', priority: 'medium' },
          { days: 30, action: 'final_assessment', priority: 'low' }
        ];

      default:
        return this.getDefaultCheckpoints();
    }
  }

  async executeCheckpoint(checkpoint: Checkpoint): Promise<void> {
    // データ収集
    const currentData = await this.collectCurrentData(checkpoint);

    // 進捗評価
    const progress = this.evaluateProgress(checkpoint, currentData);

    // 通知生成
    if (progress.requiresAction) {
      await this.notifier.send({
        type: 'follow_up_required',
        checkpoint,
        progress,
        suggestedActions: this.suggestActions(progress)
      });
    }

    // 自動レポート更新
    await this.updateReport(checkpoint, progress);
  }
}
```

#### リマインダー管理
```typescript
interface ReminderSystem {
  // リマインダータイプ
  types: {
    followUp: {
      timing: 'scheduled';
      channels: ['push', 'email'];
      priority: 'high';
    };
    observation: {
      timing: 'periodic';
      frequency: 'daily';
      channels: ['dashboard'];
    };
    report: {
      timing: 'deadline_based';
      leadTime: '24_hours';
      channels: ['email'];
    };
  };

  // スマートリマインダー
  intelligent: {
    // 教員の行動パターン学習
    learnPattern(teacher: Teacher): TeacherPattern;

    // 最適なタイミング予測
    predictBestTime(reminder: Reminder, pattern: TeacherPattern): Date;

    // リマインダーの集約
    bundleReminders(reminders: Reminder[]): BundledReminder;
  };
}
```

### 3. レポート自動生成

#### レポートテンプレート
```typescript
class ReportGenerator {
  private templates = {
    weekly: WeeklyReportTemplate,
    incident: IncidentReportTemplate,
    progress: ProgressReportTemplate,
    parent: ParentCommunicationTemplate,
    administrative: AdministrativeReportTemplate
  };

  async generateReport(type: ReportType, params: ReportParams): Promise<Report> {
    const template = this.templates[type];
    const data = await this.collectReportData(params);

    const report = {
      title: template.generateTitle(params),
      sections: await this.generateSections(template, data),
      summary: await this.generateSummary(data),
      recommendations: await this.generateRecommendations(data),
      attachments: await this.prepareAttachments(data)
    };

    // AI による文章生成
    report.narrative = await this.generateNarrative(report);

    // フォーマット
    return this.formatReport(report, params.format);
  }

  private async generateNarrative(report: ReportData): Promise<string> {
    const prompt = `
      以下のデータに基づいて、教員向けの報告書文章を生成してください：
      ${JSON.stringify(report)}

      要件：
      - 客観的で専門的な文章
      - 重要ポイントの強調
      - 具体的な次のステップの提案
    `;

    return await this.llm.generate(prompt);
  }
}
```

#### レポート例
```markdown
# 週次クラス状況報告書
**期間**: 2024年11月11日 - 11月17日
**クラス**: 1年3組
**作成日**: 2024年11月18日

## エグゼクティブサマリー
今週のクラス全体の健全性スコアは72/100で、先週比で5ポイント改善しました。
特に注目すべき点は、生徒B君の状況が安定化したことです。

## 主要な出来事と対応
### 1. 生徒B - いじめリスクの早期発見と介入
- **検出日**: 11月12日
- **対応**: 即日個別面談実施、関係生徒との調整
- **現状**: 改善傾向、継続観察中

### 2. 生徒E - 学習困難の兆候
- **検出日**: 11月14日
- **対応**: 学習支援計画策定
- **次回アクション**: 11月20日に保護者面談予定

## 統計データ
- 出席率: 96.5% (前週比 +1.2%)
- 遅刻者数: 3名 (前週比 -2名)
- 提出物遅れ: 2件 (前週比 -3件)

## 来週の重点事項
1. 生徒Bの継続モニタリング
2. 期末テスト準備のサポート
3. 保護者面談の実施（3件）

## AIからの提案
- 金曜日の6時間目にクラス活動を実施することを推奨
- 生徒間の交流を促進するグループワークの機会を増やす
```

### 4. 介入支援AI

#### 介入提案システム
```python
class InterventionAdvisor:
    def __init__(self):
        self.knowledge_base = InterventionKnowledgeBase()
        self.success_predictor = SuccessPredictionModel()

    def suggest_intervention(self, situation: Situation) -> InterventionPlan:
        # 1. 類似ケース検索
        similar_cases = self.knowledge_base.find_similar(situation)

        # 2. 成功率予測
        interventions = []
        for case in similar_cases:
            success_rate = self.success_predictor.predict(
                intervention=case.intervention,
                situation=situation
            )
            interventions.append({
                'method': case.intervention,
                'success_rate': success_rate,
                'effort_required': case.effort
            })

        # 3. 最適な介入方法選択
        best_intervention = self.select_optimal(interventions, situation)

        # 4. カスタマイズ
        customized = self.customize_for_student(
            best_intervention,
            situation.student
        )

        # 5. 実行計画生成
        return self.create_execution_plan(customized)

    def create_execution_plan(self, intervention):
        return {
            'steps': self.break_down_steps(intervention),
            'timeline': self.create_timeline(intervention),
            'resources': self.identify_resources(intervention),
            'success_metrics': self.define_metrics(intervention),
            'risk_mitigation': self.identify_risks(intervention)
        }
```

#### 対話スクリプト生成
```typescript
class ConversationScriptGenerator {
  generateScript(context: StudentContext): ConversationScript {
    return {
      opening: this.generateOpening(context),
      mainPoints: this.generateMainPoints(context),
      difficultTopics: this.handleDifficultTopics(context),
      closing: this.generateClosing(context),

      // 状況別の対応
      ifStatements: {
        ifDenial: this.generateDenialResponse(context),
        ifEmotional: this.generateEmotionalSupport(context),
        ifSilent: this.generateSilenceHandling(context)
      },

      // 使用を推奨する言い回し
      recommendedPhrases: [
        "君のことを心配している人がいるんだ",
        "一緒に解決策を考えよう",
        "君の気持ちを聞かせてくれる？"
      ],

      // 避けるべき表現
      avoidPhrases: [
        "なぜそんなことをしたの？",
        "みんなが迷惑している",
        "もっと頑張らないと"
      ]
    };
  }
}
```

## ユーザーインターフェース

### メインダッシュボード画面
```
┌────────────────────────────────────────────────┐
│  📊 クラスダッシュボード    1年3組     [設定]  │
├────────────────────────────────────────────────┤
│                                                │
│  クラス健全性 ████████░░ 72/100 ↑5           │
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ 要注意 (3)   │  │ 今日のタスク │          │
│  │ • 生徒B 観察 │  │ □ 生徒B確認  │          │
│  │ • 生徒E 学習 │  │ □ 報告書提出 │          │
│  │ • 生徒H 欠席 │  │ □ 面談準備   │          │
│  └──────────────┘  └──────────────┘          │
│                                                │
│  週間トレンド                                  │
│  ┌────────────────────────────────┐           │
│  │     ╱─────────                  │           │
│  │   ╱                              │           │
│  │ ─────                            │           │
│  └────────────────────────────────┘           │
│                                                │
│  クイックアクション                           │
│  [📝 観察記録] [📊 レポート] [👥 面談記録]   │
│                                                │
└────────────────────────────────────────────────┘
```

### モバイル通知画面
```
┌─────────────────────────┐
│  🔔 フォローアップ通知   │
├─────────────────────────┤
│                         │
│  生徒B - 3日後確認      │
│  月曜日の介入から3日    │
│  経過しました           │
│                         │
│  推奨アクション:        │
│  • 簡単な声かけ        │
│  • 様子の観察          │
│  • 必要なら再面談      │
│                         │
│  [確認済み] [詳細表示]  │
│                         │
└─────────────────────────┘
```

## データ分析機能

### 予測分析
```python
class PredictiveAnalytics:
    def analyze_class_trajectory(self, class_id: str) -> ClassPrediction:
        # 過去データ取得
        historical = self.get_historical_data(class_id)

        # 特徴量抽出
        features = self.extract_temporal_features(historical)

        # 予測モデル実行
        predictions = {
            'risk_students': self.predict_at_risk_students(features),
            'class_atmosphere': self.predict_atmosphere_change(features),
            'academic_performance': self.predict_performance(features),
            'intervention_needs': self.predict_intervention_timing(features)
        }

        # 信頼区間計算
        confidence_intervals = self.calculate_confidence(predictions)

        return ClassPrediction(predictions, confidence_intervals)
```

### 比較分析
```typescript
interface ComparativeAnalysis {
  // クラス間比較
  crossClass: {
    metrics: ['attendance', 'incidents', 'performance'];
    visualization: 'radar_chart';
    insights: string[];
  };

  // 時系列比較
  temporal: {
    currentVsPrevious: Comparison;
    yearOverYear: Comparison;
    trends: Trend[];
  };

  // ベンチマーク
  benchmarks: {
    schoolAverage: number;
    districtAverage: number;
    nationalAverage: number;
  };
}
```

## 通知＆コミュニケーション

### 多チャンネル通知
```typescript
class NotificationManager {
  private channels = {
    push: PushNotificationService,
    email: EmailService,
    sms: SMSService,
    line: LINEBotService,
    slack: SlackIntegration
  };

  async notify(notification: Notification): Promise<void> {
    // 優先度別チャンネル選択
    const channels = this.selectChannels(notification.priority);

    // 教員の設定確認
    const preferences = await this.getTeacherPreferences();

    // 通知送信
    for (const channel of channels) {
      if (preferences.enabled[channel]) {
        await this.send(channel, notification);
      }
    }

    // 配信確認
    await this.trackDelivery(notification);
  }
}
```

## パフォーマンス最適化

### キャッシュ戦略
```typescript
class CacheStrategy {
  // 多層キャッシュ
  layers = {
    memory: new MemoryCache({ ttl: 60 }),      // 1分
    redis: new RedisCache({ ttl: 3600 }),      // 1時間
    cdn: new CDNCache({ ttl: 86400 })          // 1日
  };

  // インテリジェントキャッシュ
  intelligent = {
    // アクセスパターン学習
    learnAccessPattern(): AccessPattern;

    // 先読みキャッシュ
    prefetch(pattern: AccessPattern): void;

    // 動的TTL調整
    adjustTTL(key: string, accessFrequency: number): number;
  };
}
```

## セキュリティ＆コンプライアンス

### アクセス制御
```typescript
interface AccessControl {
  // ロールベース
  roles: {
    teacher: ['view_own_class', 'create_report', 'view_alerts'];
    counselor: ['view_all_students', 'create_intervention'];
    principal: ['view_all', 'approve_report'];
    parent: ['view_own_child', 'view_summary'];
  };

  // データマスキング
  masking: {
    pii: ['student_name', 'address', 'phone'];
    sensitive: ['mental_health', 'family_issues'];
    conditional: ['grades', 'incidents'];
  };
}
```

## 開発ロードマップ

### Phase 4.1（Month 1）
- [ ] 基本ダッシュボード実装
- [ ] シンプルなフォローアップ機能
- [ ] 手動レポート生成

### Phase 4.2（Month 2）
- [ ] 自動モニタリング機能
- [ ] AIレポート生成
- [ ] 通知システム

### Phase 4.3（Month 3）
- [ ] 予測分析機能
- [ ] 介入支援AI
- [ ] モバイルアプリ

## 成功指標

| KPI | 目標値 | 測定方法 |
|-----|--------|---------|
| レポート作成時間削減 | 70% | 作成時間の前後比較 |
| フォローアップ実施率 | 95% | 完了タスク/全タスク |
| 教員満足度 | 4.5/5.0 | アンケート調査 |
| 早期介入成功率 | 80% | 改善した生徒/介入総数 |

## まとめ

モニタリング＆サポートエージェントは、教員の事務作業を大幅に削減し、生徒への個別対応の質を向上させます。継続的なモニタリングとタイムリーなサポートにより、問題の早期発見と解決を実現します。