export type AlertLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertCategory = 'bullying' | 'academic' | 'mental' | 'family' | 'social';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'monitoring';

export interface Alert {
    id: string;
    studentId: string;
    studentName: string;
    level: AlertLevel;
    category: AlertCategory;
    title: string;
    summary: string;
    explanation: string;
    evidences: string[];
    actions: Action[];
    relatedAlerts: string[];
    timestamp: Date;
    status: AlertStatus;
}

export interface Action {
    id: string;
    text: string;
    type: 'interview' | 'contact_parents' | 'counseling' | 'observation' | 'other';
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

export interface RiskProfile {
    studentId: string;
    score: number; // 0-100
    primaryCategory: AlertCategory;
    dimensions: {
        severity: number;
        urgency: number;
        confidence: number;
    };
    evidences: string[];
}

export interface Student {
    id: string;
    name: string;
    grade: number;
    class: string;
}
