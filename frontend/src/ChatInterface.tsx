import { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Cpu, Menu, X, Plus, MessageSquare 
} from 'lucide-react';

// --- TİPLER ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// Backend'den gelen ham verinin tipi
interface BackendMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
}

function ChatInterface() {
  // --- STATE YÖNETİMİ ---
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Merhaba! Ben NexusAI. Geçmişi hatırlayabilen gelişmiş bir yapay zekayım. Sana nasıl yardımcı olabilirim?' }
  ]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. BAŞLANGIÇTA GEÇMİŞ SOHBETLERİ ÇEK ---
  useEffect(() => {
    fetchSessions();
  }, []);

  // Otomatik Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- API FONKSİYONLARI ---

  // A. Sohbet Listesini Getir
  const fetchSessions = async () => {
  // 1. Token'ı al
    const token = localStorage.getItem('token'); // İsmi 'jwt' ise onu yaz
    if (!token) return;

    try {
      const response = await fetch('http://localhost:9090/api/v1/chat/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 İŞTE EKSİK PARÇA!
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data); // Listeyi güncelle
      }
    } catch (error) {
      console.error("Geçmiş yüklenirken hata:", error);
    }
  };

  // B. Bir Sohbete Tıklandığında Mesajları Yükle
  const loadSession = async (sessionId: number) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false); // Mobilde menüyü kapat

    try {
      const res = await fetch(`http://localhost:9090/api/v1/chat/sessions/${sessionId}/messages`);
      if (res.ok) {
        const data: BackendMessage[] = await res.json(); // Burada 'any' yerine tipi belirttik
        
        // Backend verisini Frontend formatına çevir
        const formattedMessages: Message[] = data.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Mesajlar yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // C. Yeni Sohbet Başlat
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{ role: 'assistant', content: 'Yeni bir sayfa açtık! Ne konuşmak istersin?' }]);
    setIsSidebarOpen(false);
  };

  // D. Mesaj Gönder
  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. ÖNCE TOKEN'I AL (Burası kritik!)
    // Giriş yaparken token'ı 'token' adıyla kaydettiğini varsayıyorum.
    // Eğer farklı bir isimle kaydettiysen (örn: 'jwtToken') onu yaz.
    const token = localStorage.getItem('token'); 

    if (!token) {
        console.error("Token bulunamadı! Kullanıcı giriş yapmamış.");
        // İstersen kullanıcıyı login sayfasına yönlendirebilirsin
        return;
    }

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let url = 'http://localhost:9090/api/v1/chat';
      if (currentSessionId) {
        url += `?sessionId=${currentSessionId}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // 👇 İŞTE EKSİK OLAN SİHİRLİ SATIR BURASI!
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ question: userMsg.content }),
      });

      if (!response.ok) {
          // Eğer 403 alırsak token süresi dolmuş olabilir
          if (response.status === 403) {
              throw new Error("Yetkisiz Erişim: Lütfen tekrar giriş yapın.");
          }
          throw new Error('Sunucu hatası');
      }
      
      const data = await response.json();
      let answerText = data.answer;

      if (answerText.includes("##SESSION_ID:")) {
        const parts = answerText.split("##SESSION_ID:");
        answerText = parts[0]; 
        const newSessionId = parseInt(parts[1]); 
        
        if (!currentSessionId) {
          setCurrentSessionId(newSessionId);
          fetchSessions(); 
        }
      }

      const botMsg: Message = { role: 'assistant', content: answerText };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);

      let errorMessage = "Backend bağlantısı koptu.";

      // Hata gerçekten bir "Error" nesnesi mi diye kontrol ediyoruz
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: `⚠️ Hata: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-100 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 z-30 h-full w-72 bg-[#161b22] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-lg">
            <Cpu size={24} />
            <span>NexusAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Yeni Sohbet */}
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Sohbet Listesi */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">Geçmiş Sohbetler</p>
          {sessions.length === 0 && (
             <p className="text-xs text-gray-600 px-3 italic">Henüz sohbet yok...</p>
          )}
          {sessions.map((session) => (
            <button 
              key={session.id} 
              onClick={() => loadSession(session.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-left group
                ${currentSessionId === session.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'} />
              <div className="flex-1 truncate text-sm">{session.title}</div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">BK</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Buğra Kaan</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- ANA EKRAN --- */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobil Menü Butonu */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#161b22] border-b border-gray-800">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white"><Menu size={24} /></button>
          <span className="font-bold text-gray-200">NexusAI</span>
          <div className="w-6" />
        </div>

        {/* Mesaj Alanı */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mr-3 shadow-lg shadow-blue-900/30 shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`
                relative max-w-[85%] lg:max-w-[70%] px-5 py-4 rounded-2xl shadow-md text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1f2937] text-gray-100 border border-gray-700 rounded-tl-none'}
              `}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center ml-3 shadow-lg shadow-purple-900/30 shrink-0 mt-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Yükleniyor Animasyonu */}
          {isLoading && (
            <div className="flex justify-start items-center space-x-2">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mr-3 mt-1">
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
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
                  ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default ChatInterface;