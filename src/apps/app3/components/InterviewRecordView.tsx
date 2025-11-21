import React, { useState, useEffect, useRef } from 'react';
import type { Alert, Action } from '../lib/types';
import { ArrowLeft, Brain, Save, Sparkles, Video, Clock, CheckCircle2, Circle, Mic, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InterviewRecordViewProps {
    alert: Alert;
    action: Action;
    onBack: () => void;
    onSave: (record: InterviewRecord) => void;
}

export interface InterviewRecord {
    actionId: string;
    studentId: string;
    studentName: string;
    date: string;
    time: string;
    content: string;
    aiSuggestions?: string;
    checkedItems?: string[];
}

interface CheckItem {
    id: string;
    text: string;
    checked: boolean;
}

export const InterviewRecordView: React.FC<InterviewRecordViewProps> = ({
    alert,
    action,
    onBack,
    onSave
}) => {
    const [date] = useState(new Date().toISOString().split('T')[0]);
    const [time] = useState(new Date().toTimeString().slice(0, 5));
    const [content, setContent] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<string>('');
    const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [meetingStartTime] = useState(new Date());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // 経過時間の更新
    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Math.floor((new Date().getTime() - meetingStartTime.getTime()) / 1000);
            setElapsedTime(elapsed);
        }, 1000);
        return () => clearInterval(interval);
    }, [meetingStartTime]);

    // カメラのON/OFF処理
    useEffect(() => {
        return () => {
            // コンポーネントのアンマウント時にカメラを停止
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    const handleToggleCamera = async () => {
        if (isCameraOn) {
            // カメラをOFFにする
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false);
        } else {
            // カメラをONにする
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // playの呼び出しを明示的にawaitする
                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.error('Error playing video:', playError);
                    }
                }
                setIsCameraOn(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                window.alert('カメラへのアクセスに失敗しました。カメラの権限を確認してください。');
            }
        }
    };

    // AIによる確認項目サジェストを取得
    useEffect(() => {
        const fetchAISuggestions = async () => {
            if (!content.trim()) {
                setAiSuggestions('');
                setCheckItems([]);
                return;
            }

            setIsLoadingSuggestions(true);
            try {
                const result = await getInterviewSuggestions(alert, content);
                setAiSuggestions(result.suggestions);
                setCheckItems(result.checkItems);
            } catch (error) {
                console.error('Failed to get AI suggestions:', error);
                setAiSuggestions('AIサポートの取得に失敗しました。');
                setCheckItems([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        // デバウンス: 入力が止まってから1秒後に実行
        const timer = setTimeout(fetchAISuggestions, 1000);
        return () => clearTimeout(timer);
    }, [content, alert]);

    const handleToggleCheck = (id: string) => {
        setCheckItems(items =>
            items.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleSave = () => {
        // カメラを停止
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);

        const record: InterviewRecord = {
            actionId: action.id,
            studentId: alert.studentId,
            studentName: alert.studentName,
            date,
            time,
            content,
            aiSuggestions: aiSuggestions || undefined,
            checkedItems: checkItems.filter(item => item.checked).map(item => item.text)
        };
        onSave(record);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Web Meeting Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Video className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">面談記録セッション</h2>
                                <p className="text-sm text-gray-400">{alert.studentName} との面談</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300 font-mono">{formatTime(elapsedTime)}</span>
                        </div>
                        <Button
                            onClick={handleToggleCamera}
                            variant="outline"
                            size="sm"
                            className={`${isCameraOn ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
                        >
                            {isCameraOn ? (
                                <>
                                    <VideoOff className="h-4 w-4 mr-2" />
                                    カメラOFF
                                </>
                            ) : (
                                <>
                                    <Video className="h-4 w-4 mr-2" />
                                    カメラON
                                </>
                            )}
                        </Button>
                        <div className="flex items-center space-x-2">
                            <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-300">記録中</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-73px)]">
                {/* Main Content Area: Video Meeting */}
                <div className="flex-1 flex flex-col bg-gray-900 relative">
                    {/* Video Grid - Main Display */}
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="grid grid-cols-2 gap-4 w-full max-w-6xl h-full">
                            {/* Teacher Video */}
                            <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
                                {isCameraOn ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
                                                佐
                                            </div>
                                            <p className="text-white font-medium">佐藤 先生</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-lg">
                                    <Mic className="h-4 w-4 text-green-400" />
                                    <span className="text-white text-sm">マイクON</span>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">佐藤 先生</span>
                                </div>
                            </div>

                            {/* Student Video */}
                            <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
                                            {alert.studentName.charAt(0)}
                                        </div>
                                        <p className="text-white font-medium">{alert.studentName}</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-lg">
                                    <Mic className="h-4 w-4 text-green-400" />
                                    <span className="text-white text-sm">マイクON</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-xs text-gray-400">
                                    <span className="font-medium">リスクレベル:</span>{' '}
                                    <span className={`px-2 py-0.5 rounded ${
                                        alert.level === 'CRITICAL' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                        alert.level === 'HIGH' ? 'bg-orange-900/50 text-orange-300 border border-orange-700' :
                                        'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                                    }`}>
                                        {alert.level}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    <span className="font-medium">カテゴリ:</span> <span className="text-gray-300">{alert.category}</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={!content.trim()}
                                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                記録を保存して終了
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Notes & AI Suggestions */}
                <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
                    {/* Sidebar Header */}
                    <div className="px-4 py-3 border-b border-gray-700">
                        <h3 className="text-sm font-semibold text-white">議事録 & AIサポート</h3>
                    </div>

                    {/* Notes Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="px-4 py-3 border-b border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-300">議事録</span>
                                <span className="text-xs text-gray-500">{content.length} 文字</span>
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="px-4 py-3">
                                <textarea
                                    ref={contentRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="面談で話した内容、生徒の様子、気づいた点などを記録してください..."
                                    className="w-full h-full min-h-[200px] bg-gray-900 text-white placeholder-gray-500 border-0 focus:outline-none focus:ring-0 resize-none text-sm"
                                />
                            </div>
                        </ScrollArea>
                    </div>

                    {/* AI Suggestions Section */}
                    <div className="flex-1 flex flex-col min-h-0 border-t border-gray-700">
                        <div className="px-4 py-3 border-b border-gray-700">
                            <div className="flex items-center space-x-2">
                                <Brain className="h-4 w-4 text-purple-400" />
                                <span className="text-xs font-medium text-gray-300">AI確認項目</span>
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="px-4 py-3 space-y-3">
                                {!content.trim() ? (
                                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 text-gray-400 text-xs">
                                        <Sparkles className="h-4 w-4 mb-2 text-gray-500" />
                                        <p>議事録を入力すると、AIが確認すべき項目を提案します。</p>
                                    </div>
                                ) : isLoadingSuggestions ? (
                                    <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-700">
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                                            <span className="text-purple-300 text-xs">AIが分析中...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {checkItems.length > 0 && (
                                            <div className="space-y-2">
                                                {checkItems.map((item) => (
                                                    <label
                                                        key={item.id}
                                                        className="flex items-start space-x-2 p-2 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-600/50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="mt-0.5">
                                                            {item.checked ? (
                                                                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                                                            ) : (
                                                                <Circle className="h-4 w-4 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <span className={`text-xs flex-1 ${item.checked ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                                            {item.text}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.checked}
                                                            onChange={() => handleToggleCheck(item.id)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {aiSuggestions && (
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <div className="flex items-start space-x-2 mb-2">
                                                    <Sparkles className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs font-medium text-gray-300">追加アドバイス</span>
                                                </div>
                                                <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-700">
                                                    <p className="text-xs text-purple-200 whitespace-pre-wrap leading-relaxed">
                                                        {aiSuggestions}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
};

// AIによる面談サポート提案を取得（モックデータ）
async function getInterviewSuggestions(alert: Alert, _content: string): Promise<{
    suggestions: string;
    checkItems: CheckItem[];
}> {
    // モックデータ: 実際のAPI呼び出しの代わりにモックデータを返す
    // 少し遅延を入れてリアルな動作をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));

    // リスクレベルに応じたモックデータ
    const mockCheckItems = alert.level === 'CRITICAL' || alert.level === 'HIGH' ? [
        '保護者への連絡が必要か確認する',
        '次回の面談日程を設定する',
        '他の専門家（カウンセラー等）への相談を検討する',
        '生徒の安全確認（身体的・精神的）を行う',
        'クラス内での状況を継続的に観察する',
        '緊急時の連絡体制を確認する'
    ] : [
        '次回の面談日程を設定する',
        '保護者への連絡が必要か確認する',
        'クラス内での状況を継続的に観察する',
        '生徒の様子を記録し続ける',
        '必要に応じて他の教員と情報共有する'
    ];

    const mockSuggestions = alert.level === 'CRITICAL' || alert.level === 'HIGH' 
        ? `【重要】${alert.studentName}さんの状況は${alert.level}レベルです。以下の点に注意してください：

1. 保護者への連絡を早急に検討してください
2. 学校カウンセラーやスクールソーシャルワーカーへの相談を推奨します
3. 次回の面談では、より具体的な支援策について話し合いましょう
4. クラス内での状況を継続的に観察し、エスカレートしないよう注意が必要です

面談記録を基に、適切な支援計画を立てることをお勧めします。`
        : `${alert.studentName}さんの状況について、以下の点を考慮してください：

1. 定期的な面談を継続し、信頼関係を築くことが重要です
2. 保護者との連携を検討し、家庭での様子も確認しましょう
3. クラス内での観察を継続し、変化に気づけるようにしましょう
4. 必要に応じて他の教員とも情報共有を行い、包括的な支援を心がけましょう`;

    // Convert checkItems to CheckItem format
    const checkItems: CheckItem[] = mockCheckItems.map((item: string, index: number) => ({
        id: `check-${Date.now()}-${index}`,
        text: item,
        checked: false
    }));

    return {
        suggestions: mockSuggestions,
        checkItems
    };
}

