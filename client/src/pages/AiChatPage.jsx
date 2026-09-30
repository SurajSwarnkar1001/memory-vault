import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

export default function AiChatPage({ onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { messages: updatedMessages });
      setMessages([...updatedMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages([
        ...updatedMessages, 
        { role: 'assistant', content: '⚠️ **Error:** Failed to connect to the AI model. Please ensure the backend and Ollama API are running.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <Sidebar currentPath="/ai-chat" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onNavigate={onNavigate} />

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-center shadow-sm z-10 shrink-0">
            <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Bot className="text-accent" /> Ask AI
            </h1>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-20 lg:px-40 pb-32">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 mt-10">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                  <Bot className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-medium">How can I help you today?</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-slate max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <span className="text-sm text-slate-500 font-medium tracking-wide">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={endOfMessagesRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10 pb-6 px-4 md:px-20 lg:px-40">
            <form 
              onSubmit={handleSubmit}
              className="relative max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition-all"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message AI..."
                className="w-full max-h-48 min-h-[56px] py-4 pl-4 pr-14 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-slate-700 text-[15px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="text-center mt-3">
              <p className="text-[10px] text-slate-400">AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
