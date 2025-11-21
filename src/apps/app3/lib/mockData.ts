import type { Alert, Student } from './types';

export const MOCK_STUDENT_B: Student = {
    id: 'student-b',
    name: '生徒B',
    grade: 1,
    class: '3組',
};

export const MOCK_ALERT: Alert = {
    id: 'alert-001',
    studentId: MOCK_STUDENT_B.id,
    studentName: MOCK_STUDENT_B.name,
    level: 'HIGH',
    category: 'social',
    title: '【要確認】クラス内摩擦の兆候',
    summary: '複数の情報源より、生徒Bさんを中心としたクラス内の摩擦の兆候を検知しました。',
    explanation: '朝のホームルームでの不機嫌な様子（教員入力）に加え、休み時間に他生徒に対して強い口調で接していたとの報告（生徒エージェント）があり、ストレスが対人トラブルに発展しつつある可能性が高いです。',
    evidences: [
        '【教員入力】朝のHRで機嫌が悪そう、机を蹴る仕草',
        '【生徒エージェント】休み時間に他生徒へ強い口調、教室の雰囲気が悪化',
        '【部活動記録】最近レギュラー落ちしている（背景要因の可能性）'
    ],
    actions: [
        {
            id: 'action-1',
            text: '本日中に、生徒Bと短時間の個別面談を行う（所要目安：10分）',
            type: 'interview',
            priority: 'high',
            completed: false,
        },
        {
            id: 'action-2',
            text: '部活動の話題から入り、最近のイライラについて共感的に聞く',
            type: 'other',
            priority: 'medium',
            completed: false,
        },
        {
            id: 'action-3',
            text: '相手方の生徒Cの様子を、次の授業でさりげなく確認する',
            type: 'observation',
            priority: 'low',
            completed: false,
        }
    ],
    relatedAlerts: [],
    timestamp: new Date(), // Now
    status: 'new',
};
