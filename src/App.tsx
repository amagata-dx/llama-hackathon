import { useState } from 'react';
import App1 from './components/avatar-chat-app';
import { App3Page } from './apps/app3/App3Page';

export default function App() {
    const [currentApp, setCurrentApp] = useState<'app1' | 'app3'>('app3'); // Default to App 3 for demo

    return (
        <div>
            {/* Simple Navigation for Demo */}
            <div className="group fixed bottom-4 right-4 z-50">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
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
                {/* Hover trigger - small visible indicator with larger hover area */}
                <div className="absolute bottom-0 right-0 w-12 h-12 -mb-2 -mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
            </div>

            {currentApp === 'app1' ? <App1 /> : <App3Page />}
        </div>
    );
}
