import { useState, useCallback } from 'react';
import type { Alert } from './types';
import { MOCK_ALERT } from './mockData';

export function useRiskEngine() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [activeAlert, setActiveAlert] = useState<Alert | null>(null);

    // Simulate receiving an alert (Scene 3)
    const triggerScenarioAlert = useCallback(() => {
        // In a real app, this would come from a websocket or polling
        setAlerts([MOCK_ALERT]);
        // Optionally auto-show the popup
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
        completeAction
    };
}
