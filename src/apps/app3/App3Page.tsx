import React, { useEffect } from 'react';
import { useRiskEngine } from './lib/RiskEngine';
import { Dashboard } from './components/Dashboard';
import { RiskDetailView } from './components/RiskDetailView';
import { AlertNotification } from './components/AlertNotification';
import { ShieldAlert } from 'lucide-react';

export const App3Page: React.FC = () => {
    const {
        alerts,
        activeAlert,
        setActiveAlert,
        triggerScenarioAlert,
        acknowledgeAlert,
        completeAction
    } = useRiskEngine();

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
                {activeAlert ? (
                    <RiskDetailView
                        alert={activeAlert}
                        onBack={handleBackToDashboard}
                        onCompleteAction={(actionId) => completeAction(activeAlert.id, actionId)}
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
