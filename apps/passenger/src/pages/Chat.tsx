import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Chat: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
        { sender: 'bot', text: 'Hi! I am the RAAHI AI Assistant. Need help finding a safe ride, checking your pass balance, or reporting an issue?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { sender: 'user', text: input }]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        setTimeout(() => {
            let reply = "I can help with that. Could you please provide more details?";
            const lower = currentInput.toLowerCase();
            if (lower.includes("pass") || lower.includes("balance")) {
                reply = "You currently have 1 active Route Pass with 8 trips remaining this month. Would you like to buy another pass?";
            } else if (lower.includes("safe") || lower.includes("danger") || lower.includes("help")) {
                reply = "Your safety is our priority. You can access the Safety Center from the home page to trigger an SOS or enable secure ride recording.";
            } else if (lower.includes("late") || lower.includes("where")) {
                reply = "I've checked your scheduled ride. The driver is currently 2 minutes away. We appreciate your patience!";
            }
            
            setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen relative bg-bg-app">
            <div className="p-4 bg-surface-elevated border-b border-border-subtle z-10 flex items-center justify-between shadow-sm">
                <div className="font-bold text-primary tracking-widest flex items-center gap-2 text-sm uppercase">
                    <MessageSquare size={18} /> AI Assistant
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface text-text-muted hover:text-text-primary transition-colors" onClick={() => navigate('/')}>
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-32">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 text-[15px] leading-relaxed font-medium ${msg.sender === 'user' ? 'bg-primary text-bg-app rounded-[24px] rounded-tr-[4px] glow-primary' : 'bg-surface-elevated text-text-primary rounded-[24px] rounded-tl-[4px] border border-border-subtle shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-elevated border border-border-subtle p-4 rounded-[24px] rounded-tl-[4px] flex gap-1.5 shadow-sm items-center h-12">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.15s'}} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.3s'}} />
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle pb-8">
                <div className="flex gap-3 max-w-lg mx-auto relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-bg-app border border-border-subtle rounded-full py-4 pl-6 pr-16 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted font-medium"
                    />
                    <button 
                        onClick={handleSend} 
                        className={`absolute right-2 top-2 bottom-2 w-10 bg-primary text-bg-app rounded-full flex items-center justify-center transition-all ${input.trim() ? 'opacity-100 hover:bg-primary-dark cursor-pointer' : 'opacity-50 cursor-default'}`}
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
