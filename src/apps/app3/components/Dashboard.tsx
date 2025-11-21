import React from 'react';
import type { Alert } from '../lib/types';
import { Bell, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
    alerts: Alert[];
    onViewAlert: (alertId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ alerts, onViewAlert }) => {
    const activeAlerts = alerts.filter(a => a.status !== 'resolved' && a.status !== 'monitoring');
    const monitoringAlerts = alerts.filter(a => a.status === 'monitoring');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">要対応アラート</h3>
                        <Bell className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{activeAlerts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">経過観察中</h3>
                        <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{monitoringAlerts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">今月の解決件数</h3>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">最新のアラート</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            現在、新しいアラートはありません。
                        </div>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewAlert(alert.id)}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                alert.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {alert.level}
                                            </span>
                                            <span className="text-sm text-gray-500">{new Date(alert.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-base font-medium text-gray-900 mb-1">{alert.title}</h4>
                                        <p className="text-sm text-gray-600 line-clamp-2">{alert.summary}</p>
                                    </div>
                                    <div className="flex-shrink-0 ml-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                            alert.status === 'monitoring' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {alert.status === 'new' ? '新規' :
                                                alert.status === 'monitoring' ? '観察中' : '確認済'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
