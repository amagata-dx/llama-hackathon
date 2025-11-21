
import { useState, useCallback } from 'react';
import type { Alert } from './types';
import { MOCK_STUDENT_B, MOCK_ALERT } from './mockData';

import { analyzeRiskWithLlama } from './llm';

export function useRiskEngine() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Simulate receiving an alert (Scene 3)
    const triggerScenarioAlert = useCallback(async () => {
        setIsLoading(true);
        try {
            // Scenario Data
            const teacherInput = "朝のHRで機嫌が悪そう。机を蹴る仕草。最近部活でレギュラー落ちした影響かもしれない。要注意。";
            const studentAgentReport = "休み時間に、BくんがCくんに強い口調で話しかけてて、周りが静かになっちゃって。ちょっと怖かった。";

            const analysisResult = await analyzeRiskWithLlama(teacherInput, studentAgentReport);

            const newAlert: Alert = {
                id: `alert-${Date.now()}`,
                studentId: MOCK_STUDENT_B.id,
                studentName: MOCK_STUDENT_B.name,
                ...analysisResult,
                relatedAlerts: [],
                timestamp: new Date(),
                status: 'new',
            };

            setAlerts([newAlert]);
        } catch (error) {
            console.error("Failed to analyze risk:", error);
            // Fallback to mock if API fails
            setAlerts([MOCK_ALERT]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const acknowledgeAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, status: 'acknowledged' as const } : a
        ));
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            setActiveAlert({ ...alert, status: 'acknowledged' });
        }
    }, [alerts]);

    const completeAction = useCallback((alertId: string, actionId: string) => {
        setAlerts(prev => prev.map(a => {
            if (a.id !== alertId) return a;

            const updatedActions = a.actions.map(act =>
                act.id === actionId ? { ...act, completed: true } : act
            );

            // Check if all high priority actions are done
            const allHighPriorityDone = updatedActions
                .filter(act => act.priority === 'high')
                .every(act => act.completed);

            const newStatus = allHighPriorityDone ? 'monitoring' as const : a.status;

            return {
                ...a,
                actions: updatedActions,
                status: newStatus
            };
        }));

        // Update active alert if it matches
        setActiveAlert(prev => {
            if (!prev || prev.id !== alertId) return prev;
            const updatedActions = prev.actions.map(act =>
                act.id === actionId ? { ...act, completed: true } : act
            );
            const allHighPriorityDone = updatedActions
                .filter(act => act.priority === 'high')
                .every(act => act.completed);
            const newStatus = allHighPriorityDone ? 'monitoring' as const : prev.status;
            return { ...prev, actions: updatedActions, status: newStatus };
        });

    }, []);

    return {
        alerts,
        activeAlert,
        setActiveAlert,
        triggerScenarioAlert,
        acknowledgeAlert,
        completeAction,
        isLoading
    };
}

