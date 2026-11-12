import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Sparkles, X, Loader2, MessageSquare } from "lucide-react";
import { Lang } from "../data/meedanData";

interface AssistantDrawerProps {
  lang: Lang;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AssistantDrawer({
  lang,
  open,
  onOpen,
  onClose,
}: AssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const quickPrompts =
    lang === "ar"
      ? [
          "ما هي أسعار حجز المكاتب وقاعات التدريب؟",
          "رشح لي مساراً تدريبياً يناسب مبرمج مبتدئ",
          "كيف أحجز عيادة إرشاد مجانية وما المواعيد المتاحة؟",
          "ما هي الفعاليات القادمة في ميدان هب؟",
        ]
      : [
          "What are the desk & training room booking rates?",
          "Which accredited academy track fits a beginner?",
          "How do I book a free 30-min mentorship clinic?",
          "What upcoming community events are scheduled?",
        ];

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || streaming) return;

    const historySnapshot = [...messages];
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setErrorMsg(null);
    setStreaming(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historySnapshot,
          lang,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            (lang === "ar"
              ? "تعذر الاتصال بالمساعد المهني الآن."
              : "Unable to connect to the assistant right now.")
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const line = evt
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!line) continue;
          const payload = JSON.parse(line.slice(6)) as {
            text?: string;
            done?: boolean;
            error?: string;
          };

          if (payload.error) {
            throw new Error(payload.error);
          }

          if (payload.text) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: updated[lastIdx].content + payload.text,
                };
              }
              return updated;
            });
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setErrorMsg(
        err instanceof Error
          ? err.message
          : lang === "ar"
            ? "حدث خطأ غير متوقع."
            : "Unexpected error occurred."
      );
    } finally {
      setStreaming(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Compact Floating Launcher when drawer is closed */}
      {!open && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={
            lang === "ar"
              ? "افتح المساعد المهني الذكي"
              : "Open AI Professional Assistant"
          }
          className="fixed bottom-5 end-5 z-40 h-12 px-4 rounded-full bg-[#1B5E7A] hover:bg-[#134459] text-white shadow-lg border border-white/15 inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B41A]"
        >
          <MessageSquare className="w-4 h-4 text-[#F4B41A]" />
          <span>
            {lang === "ar" ? "المساعد المهني" : "AI Assistant"}
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            lang === "ar" ? "المساعد المهني الذكي" : "AI Professional Assistant"
          }
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end"
        >
          <div className="w-full max-w-md bg-white h-full flex flex-col border-s border-slate-200 shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-[#1B5E7A] text-white">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#F4B41A]" />
                <div>
                  <h3 className="font-extrabold text-base">
                    {lang === "ar"
                      ? "المساعد المهني الذكي"
                      : "AI Professional Assistant"}
                  </h3>
                  <p className="text-xs text-slate-200">
                    {lang === "ar"
                      ? "إجابات فورية عن الحجز، التدريب، الإرشاد والفعاليات"
                      : "Real-time answers on booking, training, mentorship & events"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50"
            >
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
                    {lang === "ar"
                      ? "أهلاً بك في ميدان هب! اسألني مباشرة عن حجز المكاتب والقاعات، المسارات التدريبية المعتمدة، عيادات الإرشاد المجانية، أو الفعاليات القادمة."
                      : "Welcome to Meedan Hub! Ask me anything about space booking, accredited academy tracks, free mentorship clinics, or upcoming community events."}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500">
                      {lang === "ar" ? "أسئلة مقترحة:" : "Quick Questions:"}
                    </div>
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-start text-xs font-semibold text-[#1B5E7A] bg-white hover:bg-[#E6F5F3] border border-slate-200 hover:border-[#3A9D8F] rounded-xl p-3 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#1B5E7A] text-white"
                          : "bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      {msg.content || (
                        <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3A9D8F]" />
                          <span>
                            {lang === "ar"
                              ? "جارٍ صياغة الإجابة..."
                              : "Typing response..."}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "اسأل عن الحجز، التدريب، الإرشاد أو الفعاليات..."
                    : "Ask about booking, training, mentorship or events..."
                }
                className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="h-11 w-11 rounded-xl bg-[#F4B41A] hover:bg-[#DFA00D] disabled:opacity-50 text-slate-900 flex items-center justify-center shrink-0 transition-colors"
                aria-label={lang === "ar" ? "إرسال" : "Send"}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
