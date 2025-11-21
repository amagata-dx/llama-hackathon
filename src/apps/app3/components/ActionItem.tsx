import React from 'react';
import type { Action } from '../lib/types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ActionItemProps {
    action: Action;
    onComplete: () => void;
}

export const ActionItem: React.FC<ActionItemProps> = ({ action, onComplete }) => {
    return (
        <div className={`flex items-start p-3 rounded-lg border ${action.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300 transition-colors'}`}>
            <button
                onClick={onComplete}
                disabled={action.completed}
                className={`mt-0.5 mr-3 flex-shrink-0 ${action.completed ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'}`}
            >
                {action.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>

            <div className="flex-1">
                <p className={`text-sm ${action.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {action.text}
                </p>
                <div className="flex mt-1 space-x-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${action.priority === 'high' ? 'bg-red-100 text-red-700' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {action.priority === 'high' ? '優先度：高' :
                            action.priority === 'medium' ? '優先度：中' : '優先度：低'}
                    </span>
                    <span className="text-xs text-gray-400 px-1.5 py-0.5">
                        {action.type === 'interview' ? '面談' :
                            action.type === 'observation' ? '観察' : 'その他'}
                    </span>
                </div>
            </div>
        </div>
    );
};
