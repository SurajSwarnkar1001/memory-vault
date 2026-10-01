import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import api from '../../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiChatPanel({ projectId, projectName, onClose }) {
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
      const { data } = await api.post('/ai/chat', { 
        messages: updatedMessages,
        projectId: projectId
      });
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
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex flex-col">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-accent" /> Vault AI
          </h2>
          {projectName && (
            <span className="text-[10px] text-slate-500 font-medium">
              Context: {projectName}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 mt-4">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
              <Bot className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-xs font-medium text-center px-4">
              Ask questions about entries in this project!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-slate max-w-none text-xs prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-td:border prose-th:border prose-th:bg-slate-100 prose-table:border-collapse">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  <span className="text-[11px] text-slate-500 font-medium tracking-wide">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-4 px-4">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition-all"
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
            placeholder="Ask Vault AI about this project..."
            className="w-full max-h-32 min-h-[44px] py-3 pl-3 pr-12 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-slate-700 text-xs"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
