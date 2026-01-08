import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// client do Socket.io (frontend)
const socket = io("http://localhost:5000");

function ChatPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [users, setUsers] = useState([]); // só users reais
  const [selectedUser, setSelectedUser] = useState(null);

  // "idle" | "audio" | "video"
  const [callMode, setCallMode] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [localVideoRef, setLocalVideoRef] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    const avatarPreview = localStorage.getItem("userAvatarPreview");

    if (!stored) {
      navigate("/profile");
      return;
    }

    const parsed = JSON.parse(stored);
    const fullProfile = { ...parsed, avatarPreview };
    setProfile(fullProfile);

    // registra este user real no servidor
    socket.emit("register_user", fullProfile);

    const handleUsersList = (serverUsers) => {
      setUsers(serverUsers);

      if (!selectedUser && serverUsers.length > 0) {
        const firstOther = serverUsers.find(
          (u) => u.name !== fullProfile.name
        );
        if (firstOther) setSelectedUser(firstOther);
      }
    };

    const handleReceiveMessage = (msg) => {
      const isMine = msg.from === fullProfile.name;
      setMessages((prev) => [...prev, { ...msg, isUser: isMine }]);
    };

    socket.on("users_list", handleUsersList);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("users_list", handleUsersList);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [navigate]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || !profile) return;

    const newMessage = {
      id: Date.now(),
      text: input.trim(),
      from: profile.name,
      to: selectedUser.id,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send_message", newMessage);

    setInput("");
  };

  const handleLogoutProfile = () => {
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userAvatarPreview");
    navigate("/profile");
  };

  const filteredMessages = messages.filter((m) => m.to === selectedUser?.id);

  const startAudioCall = () => {
    if (!selectedUser) return;
    setCallMode("audio");
  };

  const startVideoCall = async () => {
    if (!selectedUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      setCallMode("video");

      if (localVideoRef) {
        localVideoRef.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera/microfone:", err);
      alert("Não foi possível acessar câmera/microfone.");
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setCallMode("idle");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative w-full h-screen max-h-screen bg-slate-950 border-y border-slate-800 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="hidden sm:flex w-72 flex-col border-r border-slate-800 bg-slate-900/80">
          {/* Perfil atual */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
            <div className="relative">
              <img
                src={
                  profile?.avatarPreview ||
                  "https://ui-avatars.com/api/?background=0f172a&color=f1f5f9&name=User"
                }
                alt="me"
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/60"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {profile?.name || "Você"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {profile?.bio || "Online"}
              </p>
            </div>
          </div>

          {/* Lista de usuários reais */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 px-2 mb-1">
              Usuários online
            </p>

            {users
              .filter((u) => u.name !== profile?.name)
              .map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition ${
                    selectedUser?.id === user.id
                      ? "bg-slate-800"
                      : "hover:bg-slate-800/70"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=4ade80&color=0f172a`
                      }
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Online
                    </p>
                  </div>
                </button>
              ))}

            {users.filter((u) => u.name !== profile?.name).length === 0 && (
              <p className="text-[11px] text-slate-500 px-2 mt-2">
                Ainda não há outros usuários conectados.
              </p>
            )}
          </div>

          <div className="px-3 py-2 border-t border-slate-800">
            <button
              onClick={handleLogoutProfile}
              className="w-full text-[11px] px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              Trocar perfil
            </button>
          </div>
        </aside>

        {/* MAIN CHAT */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          {/* Header conversa */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
            <div className="flex items-center gap-3">
              {selectedUser ? (
                <>
                  <div className="relative">
                    <img
                      src={
                        selectedUser.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          selectedUser.name
                        )}&background=4ade80&color=0f172a`
                      }
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xs text-slate-400">Online agora</p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">
                  Nenhum usuário selecionado.
                </p>
              )}
            </div>

            {/* Botões de chamada */}
            {selectedUser && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startAudioCall}
                  className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 border border-slate-700"
                >
                  📞 Áudio
                </button>
                <button
                  type="button"
                  onClick={startVideoCall}
                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
                >
                  🎥 Vídeo
                </button>
              </div>
            )}
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {!selectedUser && (
              <p className="text-xs text-slate-400 text-center mt-4">
                Aguarde outro usuário entrar ou abra o app em outra aba para testar.
              </p>
            )}

            {selectedUser && filteredMessages.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-4">
                Nenhuma mensagem com {selectedUser.name} ainda.
              </p>
            )}

            {selectedUser &&
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
                      msg.isUser
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-slate-800 text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-800 bg-slate-900/80"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={
                  selectedUser
                    ? `Mensagem para ${selectedUser.name}...`
                    : "Nenhum usuário selecionado"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!selectedUser}
              />
              <button
                type="submit"
                disabled={!selectedUser}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white transition"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>

        {/* OVERLAY DE CHAMADA EM TELA CHEIA */}
        {callMode !== "idle" && selectedUser && (
          <div className="absolute inset-0 z-20 bg-black/90 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-black/40">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedUser.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedUser.name
                    )}&background=4ade80&color=0f172a`
                  }
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {callMode === "audio"
                      ? "Chamada de voz em andamento..."
                      : "Chamada de vídeo em andamento..."}
                  </p>
                </div>
              </div>
              <button
                onClick={endCall}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-xs text-white"
              >
                Encerrar
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {callMode === "video" ? (
                <video
                  className="w-3/4 h-3/4 border border-slate-700 rounded-2xl bg-black object-cover"
                  autoPlay
                  playsInline
                  muted
                  ref={(el) => {
                    setLocalVideoRef(el);
                    if (el && localStream) {
                      el.srcObject = localStream;
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <span className="text-2xl">📞</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Chamada de voz com {selectedUser.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
