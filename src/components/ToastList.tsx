import { CheckCircle2, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  variant?: "success" | "info";
}

interface ToastListProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastList({ toasts, onDismiss }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 start-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-800 flex items-start gap-3"
        >
          {toast.variant === "info" ? (
            <Info className="w-5 h-5 text-[#F4B41A] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#3A9D8F] shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium leading-snug flex-1">{toast.text}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
