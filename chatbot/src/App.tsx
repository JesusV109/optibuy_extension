import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import "./style.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "🤖 Hi! I'm OptiBuy Assistant. What product are you looking for?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user" as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://optibuy.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      if (data.success && data.data?.response) {
        setMessages(prev => [...prev, { sender: "bot", text: data.data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Gemini didn’t return a response." }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "🚫 Server not reachable." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-container">
      <h2>OptiBuy Assistant 💬</h2>
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>{m.text}</div>
        ))}
        {loading && <div className="message bot">Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask for a product..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
