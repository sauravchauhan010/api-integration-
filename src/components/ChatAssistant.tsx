import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { ref, push, onValue, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import axios from 'axios';
import Markdown from 'react-markdown';

interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number | object;
}

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use a fixed user ID for demo purposes, or generate one
  const userId = "user_demo_123"; 
  const chatRef = ref(db, `users/${userId}/conversations`);

  useEffect(() => {
    const q = query(chatRef, orderByChild('timestamp'), limitToLast(50));
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages: Message[] = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
        setMessages(loadedMessages.sort((a, b) => (a.timestamp as number) - (b.timestamp as number)));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      // 1. Save user message to Firebase
      await push(chatRef, {
        text: userMessage,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // 2. Get AI response from our API
      const response = await axios.post('/api/chat', {
        message: userMessage,
        history: messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      // 3. Save AI response to Firebase
      await push(chatRef, {
        text: response.data.text,
        sender: 'ai',
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Chat Error:', error);
      // Optional: Add error message to UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-8 left-8 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform active:scale-95"
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
          {isOpen ? 'Close Assistant' : 'AI Assistant'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-8 z-50 w-[400px] h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold">Rayna AI Assistant</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Online & Ready to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">Hello! I'm your Rayna B2B assistant. How can I help you with your travel bookings today?</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-brand text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      <div className="markdown-body prose prose-sm max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                      <Loader2 size={16} className="animate-spin text-brand" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand hover:bg-brand/5 rounded-lg transition-all disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
