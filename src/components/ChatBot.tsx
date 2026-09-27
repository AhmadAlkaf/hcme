'use client';

import { useState, useRef, useEffect } from 'react';
import { chatbotResponses, quickReplies } from '@/config/site';
import type { ChatMessage } from '@/types';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

export default function ChatBot() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'أهلاً بك في مركز حضرموت الحديث للكهربائيات! 👋 كيف يمكنني مساعدتك اليوم؟',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: quickReplies,
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const timeId = Math.random().toString(36).substring(7);

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${timeId}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Find best matching response
    setTimeout(() => {
      let response = chatbotResponses['default'];
      const lowerText = text.trim().toLowerCase();

      for (const key of Object.keys(chatbotResponses)) {
        if (key !== 'default' && lowerText.includes(key)) {
          response = chatbotResponses[key];
          break;
        }
      }

      // Check for greetings
      if (['مرحبا', 'مرحبًا', 'اهلا', 'أهلا', 'هلا', 'سلام', 'السلام'].some(g => lowerText.includes(g))) {
        response = 'أهلاً وسهلاً بك! 😊 يسعدنا تواصلك مع مركز حضرموت الحديث للكهربائيات. كيف يمكنني مساعدتك؟ يمكنك السؤال عن المنتجات، الخدمات، الأسعار، أو أي شيء آخر!';
      }

      // Check for thanks
      if (['شكر', 'شكرا', 'شكراً', 'ممتاز', 'جزاك'].some(g => lowerText.includes(g))) {
        response = 'شكراً لك! 🙏 يسعدنا خدمتك. لا تتردد في السؤال إذا احتجت أي مساعدة أخرى. نتمنى لك يوماً سعيداً! 😊';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Math.random().toString(36).substring(7)}`,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: quickReplies,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className={cn(
          "fixed bottom-6 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 z-50",
          locale === 'ar' ? "left-6" : "right-6"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="المساعد الآلي"
        id="chatbot-trigger"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-28 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-140px)] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-50 transition-all duration-300",
        locale === 'ar' ? "left-6 origin-bottom-left" : "right-6 origin-bottom-right",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-10 pointer-events-none"
      )}>
        {/* Header */}
        <div className="bg-primary p-5 flex items-center justify-between text-white shadow-md z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bot size={24} />
            </div>
            <div>
              <div className="font-bold text-lg">المساعد الآلي</div>
              <div className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                متصل الآن
              </div>
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" 
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 flex flex-col gap-4 scroll-smooth">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.sender === 'user' 
                  ? "self-end bg-primary text-white rounded-br-sm" 
                  : "self-start bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
              )}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && messages[messages.length - 1].quickReplies && (
          <div className="flex flex-wrap gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
            {messages[messages.length - 1].quickReplies?.map((reply) => (
              <button
                key={reply}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-primary hover:text-primary hover:bg-primary-subtle transition-all duration-300"
                onClick={() => sendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            placeholder="اكتب رسالتك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="chatbot-input"
          />
          <button
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-dark hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Send size={20} className="mr-1" />
          </button>
        </div>
      </div>
    </>
  );
}
