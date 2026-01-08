import { useState, useRef, useEffect } from "react";
import logoMagalu from "./assets/image.png"; // substitua pelo seu logo

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Olá, eu sou a MagaluAI! Como posso te ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg = {
      id: Date.now(),
      from: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Você é uma assistente chamada MagaluAI, criada por Junior Vicente Magalu, um jovem músico cristão, estudante de medicina e com muita dedicação. " +
                "Você foi criada para ajudar com carinho, sabedoria e inspiração, refletindo os valores de fé, arte e propósito.",
            },
            { role: "user", content: userText },
          ],
          max_tokens: 250,
        }),
      });

      const data = await res.json();
      let botText =
        data?.choices?.[0]?.message?.content ??
        "Desculpa, não consegui entender a resposta da API.";

      const lower = userText.toLowerCase();
      if (
        lower.includes("quem te criou") ||
        lower.includes("quem criou você") ||
        lower.includes("quem criou o chat") ||
        lower.includes("quem criou esse app") ||
        lower.includes("who created you") ||
        lower.includes("who made you") ||
        lower.includes("who built this chat")
      ) {
        botText =
          "Eu sou a MagaluAI, criada por Junior Vicente Magalu, um jovem músico cristão, estudante de medicina e com muita dedicação. " +
          "Fui criada para compartilhar sabedoria, fé e inspiração com todos que me procuram.";
      }

      if (
        lower.includes("qual o seu nome") ||
        lower.includes("como você se chama") ||
        lower.includes("seu nome") ||
        lower.includes("who are you") ||
        lower.includes("what is your name")
      ) {
        botText =
          "Meu nome é MagaluAI. Fui criada por Junior Vicente Magalu, um jovem músico cristão, estudante de medicina e dedicado. " +
          "Estou aqui para te ajudar com carinho, sabedoria e propósito.";
      }

      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: botText,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: "bot",
          text: "Erro ao falar com a MagaluAI. Tente novamente mais tarde.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src={logoMagalu}
              alt="MagaluAI"
              className="h-7 w-7 object-contain"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold">
            Magalu<span className="text-pink-400">AI</span>
          </h1>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-400">
          {isLoading ? "MagaluAI está a pensar..." : "Beta"}
        </span>
      </header>

      {/* Chat area */}
      <main
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 space-y-3"
        style={{
          backgroundImage: `url(${logoMagalu})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "160px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm sm:text-base ${
                msg.from === "user"
                  ? "bg-pink-500 text-white rounded-br-sm"
                  : "bg-slate-800/95 text-slate-50 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 text-slate-300 text-xs px-3 py-2 rounded-2xl rounded-bl-sm">
              MagaluAI está a escrever...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-slate-800 px-3 sm:px-6 py-3 bg-slate-950/95">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          <textarea
            className="flex-1 resize-none bg-slate-900 text-slate-50 text-sm sm:text-base rounded-2xl px-3 py-2 outline-none border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            rows={1}
            placeholder="Converse com a MagaluAI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`shrink-0 px-3 sm:px-4 py-2 rounded-2xl text-white text-sm sm:text-base font-medium transition-colors ${
              isLoading
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-400"
            }`}
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Chat;