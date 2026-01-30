import { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Cpu, Menu, X, Plus, MessageSquare
} from 'lucide-react';

// --- TİPLER ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: number;
  title: string;
  date: string;
}

function App() {
  // --- STATE (DURUM) YÖNETİMİ ---
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Merhaba! Ben NexusAI. Gelişmiş RAG motorumla sana nasıl yardımcı olabilirim?', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fake Geçmiş Sohbet Verileri (Daha sonra veritabanından gelecek)
  const [sessions] = useState<ChatSession[]>([
    { id: 1, title: 'Yapay Zeka Nedir?', date: 'Bugün' },
    { id: 2, title: 'React vs Vue', date: 'Dün' },
    { id: 3, title: 'Java Spring Boot Setup', date: '2 Gün Önce' },
  ]);

  // Otomatik Scroll için referans
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- FONKSİYONLAR ---

  const handleNewChat = () => {
    setMessages([{ role: 'assistant', content: 'Yeni sohbet başlatıldı. Ne konuşmak istersin?', timestamp: new Date() }]);
    setIsSidebarOpen(false); // Mobilde menüyü kapat
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // JAVA BACKEND BAĞLANTISI (9090 Portu)
      const response = await fetch('http://localhost:9090/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content }),
      });

      if (!response.ok) throw new Error('Sunucu hatası');
      const data = await response.json();

      const botMsg: Message = { 
        role: 'assistant', 
        content: data.answer,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: '⚠️ Bağlantı Hatası: Java Backend (Port 9090) çalışıyor mu?', timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-100 font-sans overflow-hidden">
      
      {/* --- SIDEBAR (YAN MENÜ) --- */}
      {/* Mobilde overlay (arka plan karartma) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 z-30 h-full w-72 bg-[#161b22] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-lg">
            <Cpu size={24} />
            <span>NexusAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Yeni Sohbet Butonu */}
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Geçmiş Listesi */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">Geçmiş</p>
          {sessions.map((session) => (
            <button key={session.id} className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left group">
              <MessageSquare size={16} className="text-gray-500 group-hover:text-blue-400" />
              <div className="flex-1 truncate text-sm">{session.title}</div>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
              BK
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Buğra Kaan</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>


      {/* --- ANA CHAT ALANI --- */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Mobil Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#161b22] border-b border-gray-800">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-200">NexusAI</span>
          <div className="w-6" /> {/* Dengelemek için boşluk */}
        </div>

        {/* Mesaj Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              
              {/* Asistan Avatarı */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center mr-3 shadow-lg shadow-blue-900/30 shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              {/* Mesaj Balonu */}
              <div className={`
                relative max-w-[85%] lg:max-w-[70%] px-5 py-4 rounded-2xl shadow-md text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-[#1f2937] text-gray-100 border border-gray-700 rounded-tl-none'
                }
              `}>
                {msg.content}
                <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Kullanıcı Avatarı */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center ml-3 shadow-lg shadow-purple-900/30 shrink-0 mt-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Yükleniyor Göstergesi */}
          {isLoading && (
            <div className="flex justify-start items-center space-x-2">
               <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center mr-3 mt-1">
                  <Bot size={16} className="text-white animate-pulse" />
                </div>
               <div className="bg-[#1f2937] border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none flex space-x-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Alanı */}
        <div className="p-4 lg:p-6 bg-[#0f1117]">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative flex items-center bg-[#1f2937] rounded-xl shadow-2xl border border-gray-700">
              <input
                type="text"
                className="flex-1 bg-transparent px-5 py-4 outline-none text-gray-100 placeholder-gray-500"
                placeholder="Yapay zekaya bir soru sor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <button 
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={`mr-2 p-2 rounded-lg transition-all duration-200 
                  ${input.trim() 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-gray-500">NexusAI, Spring Boot ve Python mimarisiyle güçlendirilmiştir.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;