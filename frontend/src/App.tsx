import { useState } from 'react';
import Login from './Login';
import ChatInterface from './ChatInterface'; // <--- Chat kodlarını buraya taşıdığından emin ol!

function App() {
  const [isAuthenticated] = useState(() => {
    // Uygulama açılınca Token var mı bak
    const token = localStorage.getItem("token");
    return !!token; // Varsa true, yoksa false
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // Sayfayı yenile, Login'e düşecek
  };

  // 1. Giriş yapılmadıysa LOGIN göster
  if (!isAuthenticated) {
    return <Login />;
  }

  // 2. Giriş yapıldıysa CHAT göster
  return (
    <div className="relative h-screen w-full">
       {/* Sağ üst köşeye Çıkış Butonu ekleyelim */}
       <button 
         onClick={handleLogout}
         className="absolute top-4 right-4 z-50 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all"
       >
         Çıkış Yap
       </button>
       
       {/* Asıl Chat Uygulaması */}
       <ChatInterface />
    </div>
  );
}

export default App;