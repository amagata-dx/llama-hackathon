import { useState } from 'react';
import App1 from './components/avatar-chat-app';
import { App3Page } from './apps/app3/App3Page';

export default function App() {
    const [currentApp, setCurrentApp] = useState<'app1' | 'app3'>('app3'); // Default to App 3 for demo

    return (
        <div>
            {/* Simple Navigation for Demo */}
            <div className="fixed bottom-4 left-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 flex space-x-2">
                <button
                    onClick={() => setCurrentApp('app1')}
                    className={`px-3 py-1 text-xs font-medium rounded ${currentApp === 'app1' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    App 1 (Student)
                </button>
                <button
                    onClick={() => setCurrentApp('app3')}
                    className={`px-3 py-1 text-xs font-medium rounded ${currentApp === 'app3' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    App 3 (Teacher)
                </button>
            </div>

            {currentApp === 'app1' ? <App1 /> : <App3Page />}
        </div>
    );
}
