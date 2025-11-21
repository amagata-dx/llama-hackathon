import React from 'react';
import type { Alert } from '../lib/types';
import { ActionItem } from './ActionItem';
import { ArrowLeft, Brain, FileText, MessageCircle } from 'lucide-react';

interface RiskDetailViewProps {
    alert: Alert;
    onBack: () => void;
    onCompleteAction: (actionId: string) => void;
    onStartInterview?: (alertId: string, actionId: string) => void;
}

export const RiskDetailView: React.FC<RiskDetailViewProps> = ({ alert, onBack, onCompleteAction, onStartInterview }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
                <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{alert.title}</h2>
                    <p className="text-sm text-gray-500">対象生徒: {alert.studentName}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${alert.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        alert.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        リスクレベル: {alert.level}
                    </span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Analysis & Evidence */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <Brain className="h-5 w-5 mr-2 text-purple-600" />
                            AI分析結果
                        </h3>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-gray-700 leading-relaxed">
                            {alert.explanation}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            統合された事実 (エビデンス)
                        </h3>
                        <ul className="space-y-3">
                            {alert.evidences.map((evidence, idx) => (
                                <li key={idx} className="flex items-start bg-gray-50 p-3 rounded border border-gray-100">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-2 flex-shrink-0"></span>
                                    <span className="text-gray-700 text-sm">{evidence}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Right Column: Recommended Actions */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                            推奨アクション (To Do)
                        </h3>
                        <div className="space-y-3">
                            {alert.actions.map(action => (
                                <ActionItem
                                    key={action.id}
                                    action={action}
                                    onComplete={() => onCompleteAction(action.id)}
                                    onStartInterview={onStartInterview ? () => onStartInterview(alert.id, action.id) : undefined}
                                />
                            ))}
                        </div>

                        {alert.status === 'monitoring' && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm animate-in fade-in">
                                <p className="font-bold mb-1">対応完了ありがとうございます</p>
                                <p>ステータスを「経過観察」に更新しました。3日後にフォローアップのリマインダーを送信します。</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};
