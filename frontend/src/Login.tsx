import { useState } from "react";
import api from "./Api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const res = await api.post(endpoint, { username, password });

      if (isRegister) {
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", res.data.token);
        window.location.reload();
      }
    } catch (err: unknown) { // 1. Değişiklik: 'any' yerine 'unknown'
      console.error(err);
      // 2. Değişiklik: Hata mesajını güvenli gösterme
      if (err instanceof Error) {
         setError(err.message);
      } else {
         setError("İşlem başarısız! Bilgileri kontrol et.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-500 tracking-wider">
          NexusAI
        </h2>
        
        {error && <div className="bg-red-500/20 text-red-200 p-3 mb-4 rounded text-sm border border-red-500/50">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Şifre</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-2 transition-all shadow-lg shadow-blue-600/30"
          >
            {isRegister ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          {isRegister ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-blue-400 hover:text-blue-300 font-semibold ml-1"
          >
            {isRegister ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;