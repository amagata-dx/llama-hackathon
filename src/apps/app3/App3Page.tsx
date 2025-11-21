import React, { useEffect, useState } from 'react';
import { useRiskEngine } from './lib/RiskEngine';
import { Dashboard } from './components/Dashboard';
import { RiskDetailView } from './components/RiskDetailView';
import { AlertNotification } from './components/AlertNotification';
import { InterviewRecordView, type InterviewRecord } from './components/InterviewRecordView';
import type { Action } from './lib/types';
import { ShieldAlert } from 'lucide-react';

export const App3Page: React.FC = () => {
    const {
        alerts,
        activeAlert,
        setActiveAlert,
        triggerScenarioAlert,
        acknowledgeAlert,
        completeAction,
        isLoading
    } = useRiskEngine();

    const [interviewState, setInterviewState] = useState<{
        alertId: string;
        actionId: string;
    } | null>(null);

    // Demo Control: Trigger alert after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            triggerScenarioAlert();
        }, 3000);
        return () => clearTimeout(timer);
    }, [triggerScenarioAlert]);

    const handleViewDetails = (alertId: string) => {
        acknowledgeAlert(alertId);
    };

    const handleBackToDashboard = () => {
        setActiveAlert(null);
        setInterviewState(null);
    };

    const handleStartInterview = (alertId: string, actionId: string) => {
        setActiveAlert(alerts.find(a => a.id === alertId) || null);
        setInterviewState({ alertId, actionId });
    };

    const handleSaveInterview = (record: InterviewRecord) => {
        // 面談記録を保存（実際の実装ではAPIに送信）
        console.log('Interview record saved:', record);
        
        // アクションを完了としてマーク
        if (interviewState) {
            completeAction(interviewState.alertId, record.actionId);
        }
        
        // 面談画面を閉じて詳細画面に戻る
        setInterviewState(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            {/* App Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <ShieldAlert className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">RiskGuard AI <span className="text-xs font-normal text-gray-500 ml-2">Teacher Dashboard</span></h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-right hidden sm:block">
                            <p className="font-medium text-gray-900">佐藤 先生</p>
                            <p className="text-xs text-gray-500">1年3組 担任</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                            S
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading && (
                    <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-indigo-800 font-medium">AI分析中...</p>
                        </div>
                    </div>
                )}

                {interviewState && activeAlert ? (
                    (() => {
                        const action = activeAlert.actions.find(a => a.id === interviewState.actionId);
                        if (!action) {
                            return <RiskDetailView
                                alert={activeAlert}
                                onBack={handleBackToDashboard}
                                onCompleteAction={(actionId) => completeAction(activeAlert.id, actionId)}
                            />;
                        }
                        return (
                            <InterviewRecordView
                                alert={activeAlert}
                                action={action}
                                onBack={() => setInterviewState(null)}
                                onSave={handleSaveInterview}
                            />
                        );
                    })()
                ) : activeAlert ? (
                    <RiskDetailView
                        alert={activeAlert}
                        onBack={handleBackToDashboard}
                        onCompleteAction={(actionId) => completeAction(activeAlert.id, actionId)}
                        onStartInterview={handleStartInterview}
                    />
                ) : (
                    <Dashboard
                        alerts={alerts}
                        onViewAlert={handleViewDetails}
                    />
                )}
            </main>

            {/* Popup Notification */}
            {alerts.some(a => a.status === 'new') && !activeAlert && (
                <AlertNotification
                    alert={alerts.find(a => a.status === 'new')!}
                    onClose={() => acknowledgeAlert(alerts.find(a => a.status === 'new')!.id)}
                    onViewDetails={() => handleViewDetails(alerts.find(a => a.status === 'new')!.id)}
                />
            )}
        </div>
    );
};
