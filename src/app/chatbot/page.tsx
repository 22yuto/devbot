'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  url?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'こんにちは！どのようにお手伝いできますか？' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // ユーザーメッセージを追加
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_SERVER_URL;
      const response = await fetch(url + '/chat/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました');
      }

      const data = await response.json();
      console.log('data:', data);
      
      // ボットの応答を追加
      let content = '';
      if (data.message) {
        content += data.message;
      }
      
      const botResponse: Message = {
        role: 'assistant',
        content: content || 'レスポンスが空でした'
      };
      
      // URL情報があればbotResponseに追加
      if (data.url) {
        botResponse.url = data.url;
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      // エラーメッセージを表示
      const errorMessage: Message = {
        role: 'assistant',
        content: 'すみません、エラーが発生しました。後でもう一度お試しください。'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存されたチャットを取得する関数
  const fetchSavedChats = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_SERVER_URL;
      const response = await fetch(url + '/chat/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('チャット履歴の取得に失敗しました');
      }

      const data = await response.json();
      console.log('data:', data);
      // if (data.history && data.history.length > 0) {
      //   // 履歴データを適切な形式に変換
      //   const historyMessages: Message[] = [];
        
      //   data.history.forEach((item: any) => {
      //     if (item.userMessage) {
      //       historyMessages.push({ 
      //         role: 'user', 
      //         content: item.userMessage 
      //       });
      //     }
      //     if (item.botResponse) {
      //       historyMessages.push({ 
      //         role: 'assistant', 
      //         content: item.botResponse 
      //       });
      //     }
      //   });
        
      //   setMessages([
      //     { role: 'assistant', content: 'こんにちは！どのようにお手伝いできますか？' },
      //     ...historyMessages
      //   ]);
      // } else {
      //   // 履歴がない場合のメッセージ
      //   setMessages([
      //     { role: 'assistant', content: 'こんにちは！どのようにお手伝いできますか？' },
      //     { role: 'assistant', content: '保存されたチャット履歴はありません。' }
      //   ]);
      // }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME変換中（isComposing=true）の場合は何もしない
    if (e.nativeEvent.isComposing) {
      return;
    }

    // Shift+Enterは改行のためのデフォルト動作を許可
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }

    // 通常のEnterキーで送信
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
      return;
    }
  };

  // テキストエリアの高さを自動調整する
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 一度高さをリセット
      textarea.style.height = 'auto';
      // スクロール高さに合わせて高さを設定（最小高さは56px）
      const newHeight = Math.max(56, textarea.scrollHeight);
      // max-heightを超えないようにする
      textarea.style.height = `${Math.min(newHeight, 200)}px`;
    }
  };

  // 入力内容が変わったときにテキストエリアの高さを調整
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // 新しいメッセージが追加されたときに自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* ヘッダー */}
      <header className='bg-white shadow-sm p-4'>
        <div className='max-w-6xl mx-auto flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <div className='w-10 h-10 rounded-full flex items-center justify-center overflow-hidden'>
              <Image
                src="/debu.png"
                alt="アイコン"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className='text-xl font-bold text-gray-800'>Devbot</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchSavedChats}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              保存チャットを取得
            </button>
            <Link href='/' className='text-gray-600 hover:text-gray-900'>
              ホームに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className='flex-1 max-w-6xl w-full mx-auto p-4 overflow-hidden flex flex-col'>
        {/* メッセージ表示 */}
        <div className='flex-1 overflow-y-auto mb-4 rounded-lg'>
          <div className='space-y-4 p-4'>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end pr-4 sm:pr-10 md:pr-16 lg:pr-24'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-white text-gray-800 border border-gray-200'
                      : 'text-black'
                  }`}
                >
                  <pre className="whitespace-pre-wrap break-words font-sans text-base">
                    {message.content}
                  </pre>
                  
                  {/* URLがある場合は関連ページとして表示 */}
                  {message.url && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">関連ページ：</p>
                      <a 
                        href={message.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                      >
                        {message.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className='flex justify-start'>
                <div className='bg-white border border-gray-200 p-3 rounded-xl max-w-[80%]'>
                  <div className='flex space-x-2'>
                    <div
                      className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <div className='flex-1 relative'>
            <textarea
              ref={textareaRef}
              className='w-full p-3 pr-10 text-black rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[56px] overflow-hidden'
              placeholder='メッセージを入力...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          <button
            type='submit'
            disabled={isLoading || input.trim() === ''}
            className='p-3 bg-blue-500 text-white rounded-xl h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-6'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}
