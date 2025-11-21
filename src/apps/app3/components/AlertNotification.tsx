import React from 'react';
import type { Alert } from '../lib/types';
import { AlertTriangle, X } from 'lucide-react';

interface AlertNotificationProps {
    alert: Alert;
    onClose: () => void;
    onViewDetails: () => void;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({ alert, onClose, onViewDetails }) => {
    return (
        <div className="fixed top-4 right-4 w-96 bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-4 z-50 animate-in slide-in-from-right">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="font-bold text-gray-800">要確認アラート</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">{alert.title}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.summary}</p>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                >
                    後で
                </button>
                <button
                    onClick={onViewDetails}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-sm"
                >
                    詳細を確認
                </button>
            </div>
        </div>
    );
};
