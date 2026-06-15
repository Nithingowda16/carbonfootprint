import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Leaf } from 'lucide-react';
import { api } from '../utils/api';

export default function ChatbotWidget({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load Chat History
    useEffect(() => {
        if (user && isOpen) {
            loadHistory();
        }
    }, [user, isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadHistory = async () => {
        try {
            const history = await api.getChatHistory();
            if (history.length === 0) {
                setMessages([
                    {
                        id: 'welcome',
                        sender: 'bot',
                        message: `Hello ${user.username}! I am your AI Eco Assistant. How can I help you reduce your carbon footprint today?`,
                        timestamp: new Date().toISOString()
                    }
                ]);
            } else {
                setMessages(history);
            }
        } catch (error) {
            console.error("Failed to load chat history", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text || loading) return;

        setInputText('');
        // Add user message locally
        const userMsg = {
            id: 'temp-user-' + Date.now(),
            sender: 'user',
            message: text,
            timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            const data = await api.postChatMessage(text);
            setMessages((prev) => [...prev, data.bot_message]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: 'error-' + Date.now(),
                    sender: 'bot',
                    message: "Sorry, I am having trouble connecting right now. Please try again.",
                    timestamp: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 h-[500px] mb-4 rounded-2xl shadow-2xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-float">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-eco-600 to-emerald-500 px-4 py-3 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 rounded-lg">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Eco Assistant</h3>
                                <p className="text-[10px] text-emerald-100">Online & Ready to Guide</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
                            aria-label="Close Chatbot"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                                        msg.sender === 'user'
                                            ? 'bg-eco-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700/50'
                                    }`}
                                >
                                    {/* Format bullet points and bold tags simply */}
                                    <p className="whitespace-pre-line">
                                        {msg.message}
                                    </p>
                                    <span className={`block text-[9px] mt-1 text-right ${
                                        msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                                    }`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-3.5 py-2 text-sm border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask me something..."
                            className="flex-1 text-sm bg-white dark:bg-slate-800 border rounded-full px-4 py-2 focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || loading}
                            className="p-2 rounded-full bg-eco-600 hover:bg-eco-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Send Message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 rounded-full bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-700 hover:to-emerald-600 text-white shadow-lg shadow-eco-500/20 hover:scale-105 transition-all focus:ring-4 focus:ring-eco-500/30"
                aria-label="Open AI assistant chatbot"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
}
