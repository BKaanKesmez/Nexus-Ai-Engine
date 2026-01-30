import { useState } from 'react';
import { Send, Bot, User, Cpu } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Merhaba! Ben NexusAI. Sana nasıl yardımcı olabilirim?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Kullanıcı mesajını ekle
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // --- BURAYA JAVA BAĞLANTISI GELECEK (Şimdilik taklit yapalım) ---
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: 'Şu an Java Backend ile bağlantım yok ama arayüz harika görünüyor! 😎' }
      ]);
      setIsLoading(false);
    }, 1000);
    // -------------------------------------------------------------
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      
      {/* ÜST BAR (HEADER) */}
      <div className="bg-gray-800 p-4 shadow-md flex items-center border-b border-gray-700">
        <div className="bg-blue-600 p-2 rounded-lg mr-3">
          <Cpu size={24} text-white />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">NexusAI Platform</h1>
          <p className="text-xs text-gray-400">Powered by Spring Boot & Python</p>
        </div>
      </div>

      {/* MESAJ ALANI */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {/* Bot İkonu */}
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                <Bot size={18} />
              </div>
            )}

            {/* Mesaj Balonu */}
            <div className={`max-w-[70%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-700 text-gray-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>

            {/* Kullanıcı İkonu */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center ml-2">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        
        {/* Yükleniyor Animasyonu */}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-gray-700 p-3 rounded-2xl rounded-tl-none text-gray-400 text-sm animate-pulse">
               NexusAI düşünüyor...
             </div>
           </div>
        )}
      </div>

      {/* GİRİŞ ALANI (INPUT) */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center bg-gray-700 rounded-xl px-4 py-2">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
            placeholder="Bir mesaj yaz..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            className="ml-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;