import React, { useState } from 'react';
import { Button } from 'shared';
import { MessageSquare, Send } from 'lucide-react';
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

        // Simulated OpenAI integration for chatbot since we don't have a real backend chat route configured
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
        <div className="flex flex-col h-screen relative bg-[var(--dark-bg)]">
            <div className="p-4 bg-[var(--dark-panel)] border-b border-[var(--neon-blue)] z-10 flex items-center justify-between">
                <div className="font-bold text-[var(--neon-blue)] tracking-widest flex items-center gap-2">
                    <MessageSquare size={18} /> AI ASSISTANT
                </div>
                <button className="text-[var(--text-light)] text-xs uppercase hover:text-white" onClick={() => navigate('/')}>Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-[var(--neon-blue)] text-black rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none border border-gray-700'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg rounded-tl-none flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0.1s'}} />
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0.2s'}} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[var(--dark-panel)] border-t border-gray-800">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#11151c] border border-gray-800 rounded p-3 text-white focus:border-[var(--neon-blue)] outline-none text-sm"
                    />
                    <Button onClick={handleSend} className="px-4"><Send size={18} /></Button>
                </div>
            </div>
        </div>
    );
};
