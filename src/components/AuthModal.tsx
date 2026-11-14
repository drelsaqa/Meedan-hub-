import { useState } from "react";
import { X, Loader2, LogIn, UserPlus } from "lucide-react";
import meedanLogo from "../assets/images/meedan-logo.jpg";
import { Lang } from "../data/meedanData";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  lang: Lang;
  open: boolean;
  initialMode?: "login" | "signup";
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AuthModal({
  lang,
  open,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const signedInUser = await signInWithGoogle();
      const displayName =
        signedInUser.displayName || signedInUser.email || "Member";
      onSuccess(
        lang === "ar"
          ? `مرحباً ${displayName}! تم تسجيل دخولك وحفظ تفضيلاتك.`
          : `Welcome, ${displayName}! Your account is signed in.`
      );
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("popup-closed-by-user")) {
        setErrorMsg(
          lang === "ar"
            ? "تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية."
            : "Sign-in window was closed before completing authentication."
        );
      } else {
        setErrorMsg(
          lang === "ar"
            ? "تعذر إتمام تسجيل الدخول. تأكد من السماح بالنوافذ المنبثقة وحاول مرة أخرى."
            : "Could not complete sign-in. Please allow popups and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === "ar" ? "حساب ميدان هب" : "Meedan Hub Account"}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-12 px-1.5 py-0.5 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={meedanLogo}
                alt={lang === "ar" ? "شعار ميدان هب" : "Meedan Hub Logo"}
                className="h-full w-auto object-contain"
              />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {mode === "login"
                  ? lang === "ar"
                    ? "تسجيل الدخول إلى ميدان هب"
                    : "Log In to Meedan Hub"
                  : lang === "ar"
                    ? "إنشاء حساب عضو جديد"
                    : "Create Your Meedan Hub Account"}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === "ar"
                  ? "احفظ سجل حجوزاتك وتصاريح QR وتفضيلاتك الشخصية"
                  : "Save booking history, QR passes & workspace preferences"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
              mode === "login"
                ? "bg-white text-[#1B5E7A] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "تسجيل الدخول" : "Log In"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
              mode === "signup"
                ? "bg-white text-[#1B5E7A] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "حساب جديد" : "Sign Up"}</span>
          </button>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <li>
            ·{" "}
            {lang === "ar"
              ? "حفظ وإدارة سجل الحجوزات وتصاريح الدخول الذكية (QR)"
              : "Access your saved Space Booking History & QR entry passes"}
          </li>
          <li>
            ·{" "}
            {lang === "ar"
              ? "حفظ منطقتك المفضلة وفئة العضوية واللغة تلقائياً"
              : "Sync your preferred desk zone, member tier & language"}
          </li>
          <li>
            ·{" "}
            {lang === "ar"
              ? "متابعة مسارات الأكاديمية وجلسات الإرشاد والفعاليات"
              : "Track Academy cohorts, 1-on-1 mentorship slots & Event RSVPs"}
          </li>
        </ul>

        {errorMsg && (
          <div
            role="alert"
            className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full h-12 px-5 rounded-xl bg-[#1B5E7A] hover:bg-[#134459] disabled:opacity-60 text-white font-extrabold text-sm inline-flex items-center justify-center gap-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B41A]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#FFFFFF"
                d="M21.35 11.1H12v2.92h5.35c-.23 1.47-1.7 4.3-5.35 4.3-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.68 3.88 14.55 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.8 0-.59-.07-1.04-.14-1.1z"
              />
            </svg>
          )}
          <span>
            {mode === "login"
              ? lang === "ar"
                ? "تسجيل الدخول عبر Google"
                : "Log In with Google"
              : lang === "ar"
                ? "إنشاء حساب سريع عبر Google"
                : "Sign Up with Google"}
          </span>
        </button>
      </div>
    </div>
  );
}
