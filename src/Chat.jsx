import React, { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    const userMessage = { text: userText, isUser: true };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Você é uma assistente chamada ElianaAI, criada por Jair Hilario, um jovem engenheiro de software. ' +
                'Quando ainda estava no primeiro ano, ele prometeu criar uma IA em homenagem a uma pessoa muito especial, e você é o resultado dessa promessa. ' +
                'Eliana é uma jovem linda e super apaixonada pela medicina, estudante da Universidade Católica de Moçambique (UCM).',
            },
            { role: 'user', content: userText },
          ],
          max_tokens: 250,
        }),
      });

      const data = await res.json();

      let aiText =
        data?.choices?.[0]?.message?.content ??
        'Não consegui entender a resposta da API.';

      const lower = userText.toLowerCase();

      // Quem criou
      if (
        lower.includes('quem te criou') ||
        lower.includes('quem criou você') ||
        lower.includes('quem criou o chat') ||
        lower.includes('quem criou esse app') ||
        lower.includes('who created you') ||
        lower.includes('who made you') ||
        lower.includes('who built this chat')
      ) {
        aiText =
          'Eu sou a ElianaAI, criada por Jair Hilario, um jovem engenheiro de software, que ainda no primeiro ano prometeu fazer uma IA em minha homenagem. ' +
          'Sou uma jovem linda e super apaixonada pela medicina, estudante da Universidade Católica de Moçambique (UCM).';
      }

      // Nome / quem é
      if (
        lower.includes('qual o seu nome') ||
        lower.includes('como você se chama') ||
        lower.includes('seu nome') ||
        lower.includes('who are you') ||
        lower.includes('what is your name')
      ) {
        aiText =
          'Meu nome é ElianaAI. Fui criada por Jair Hilario como uma IA em homenagem a uma pessoa muito especial. ' +
          'Sou inspirada em Eliana, uma jovem linda e super apaixonada pela medicina, estudante da Universidade Católica de Moçambique (UCM).';
      }

      setMessages(prev => [...prev, { text: aiText, isUser: false }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { text: 'Erro ao falar com a IA.', isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-2xl h-[100vh] sm:h-[90vh] bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-xl">
            💜
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-white">ElianaAI</h1>
            <p className="text-xs sm:text-sm text-purple-100">
              Assistente inspirada em Eliana · apaixonada por Medicina · UCM
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm sm:text-base ${
                  msg.isUser
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white px-4 py-2 rounded-2xl backdrop-blur-md animate-pulse text-sm sm:text-base">
                ElianaAI está digitando...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-white/10 flex-shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-slate-900/70 text-white placeholder-slate-400 border border-slate-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
              placeholder="Converse com a ElianaAI..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
