import { useState, useEffect, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Headset,
  LogIn,
  Mail,
  MapPin,
  MessageSquareWarning,
  Phone,
  Send,
} from "lucide-react";
import { Lang } from "../data/meedanData";
import {
  TicketCategory,
  TicketStatus,
  useAuth,
} from "../context/AuthContext";

interface SupportPageProps {
  lang: Lang;
  onOpenAuth: () => void;
  onNotify: (text: string, variant?: "success" | "info") => void;
}

export function SupportPage({
  lang,
  onOpenAuth,
  onNotify,
}: SupportPageProps) {
  const {
    user,
    preferences,
    privateInfo,
    supportTickets,
    createSupportTicket,
  } = useAuth();

  const [category, setCategory] = useState<TicketCategory>("inquiry");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preferences?.displayName) {
      setSenderName((prev) => prev || preferences.displayName);
    }
    if (privateInfo?.email) {
      setSenderEmail((prev) => prev || privateInfo.email);
    } else if (user?.email) {
      setSenderEmail((prev) => prev || user.email || "");
    }
    if (privateInfo?.phone) {
      setSenderPhone((prev) => prev || privateInfo.phone || "");
    }
  }, [preferences, privateInfo, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (senderName.trim().length < 2) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى كتابة الاسم الكامل."
          : "Please enter your full name."
      );
      return;
    }

    if (subject.trim().length < 3) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى كتابة عنوان واضح للرسالة (3 أحرف على الأقل)."
          : "Please enter a clear subject (at least 3 characters)."
      );
      return;
    }

    if (message.trim().length < 8) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى كتابة تفاصيل الاستفسار أو الشكوى (8 أحرف على الأقل)."
          : "Please provide details of at least 8 characters."
      );
      return;
    }

    setSubmitting(true);
    try {
      const code = await createSupportTicket({
        senderName,
        senderEmail,
        senderPhone,
        category,
        subject,
        message,
      });
      setSubject("");
      setMessage("");
      onNotify(
        lang === "ar"
          ? `تم استلام طلبك بنجاح برقم متابعة ${code}.`
          : `Ticket ${code} submitted! You can track replies below.`,
        "success"
      );
    } catch {
      setErrorMsg(
        lang === "ar"
          ? "تعذر إرسال التذكرة حالياً. يرجى المحاولة مرة أخرى."
          : "Could not submit your ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    if (status === "resolved") {
      return lang === "ar" ? "تم الحل" : "Resolved";
    }
    if (status === "in_progress") {
      return lang === "ar" ? "قيد المراجعة" : "In Progress";
    }
    return lang === "ar" ? "مفتوحة" : "Open";
  };

  const getCategoryLabel = (cat: TicketCategory) => {
    if (cat === "complaint") {
      return lang === "ar" ? "شكوى أو ملاحظة" : "Complaint";
    }
    if (cat === "support") {
      return lang === "ar" ? "دعم فني وحجوزات" : "Technical / Booking Support";
    }
    return lang === "ar" ? "استفسار عام" : "General Inquiry";
  };

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-2 max-w-2xl">
        <div className="text-xs sm:text-sm font-bold text-[#3A9D8F]">
          {lang === "ar"
            ? "خدمة العملاء والدعم المباشر"
            : "Customer Care & Complaints Desk"}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {lang === "ar"
            ? "التواصل والشكاوى وخدمة العملاء"
            : "Contact, Complaints & Customer Support"}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {lang === "ar"
            ? "فريق خدمة العملاء في ميدان هب يتابع جميع الشكاوى والاستفسارات ويضمن الرد خلال 24 ساعة عمل."
            : "Our Cairo support desk handles all booking questions, technical feedback, and complaints with a 24-hour response SLA."}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Direct Channels */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Headset className="w-5 h-5 text-[#1B5E7A]" />
              <span>
                {lang === "ar" ? "قنوات التواصل المباشر" : "Direct Channels"}
              </span>
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#3A9D8F] shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-slate-900">
                    {lang === "ar" ? "الخط الساخن وواتساب" : "Hotline & WhatsApp"}
                  </div>
                  <div className="text-slate-600 font-mono text-xs mt-0.5" dir="ltr">
                    +20 2 2578 4410
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#3A9D8F] shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-slate-900">
                    {lang === "ar" ? "بريد خدمة العملاء" : "Support Email"}
                  </div>
                  <div className="text-slate-600 font-mono text-xs mt-0.5" dir="ltr">
                    support@meedanhub.eg
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#3A9D8F] shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-slate-900">
                    {lang === "ar" ? "مكتب الاستقبال" : "Front Desk Location"}
                  </div>
                  <div className="text-slate-600 text-xs mt-0.5">
                    {lang === "ar"
                      ? "ممر الابتكار، وسط البلد، القاهرة"
                      : "Downtown Innovation Corridor, Cairo"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#F4B41A] shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-slate-900">
                    {lang === "ar" ? "ساعات العمل والرد" : "Hours & SLA"}
                  </div>
                  <div className="text-slate-600 text-xs mt-0.5">
                    {lang === "ar"
                      ? "يومياً 9 ص – 11 م · الرد خلال 24 ساعة"
                      : "Daily 9 AM – 11 PM · 24h ticket SLA"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket & Complaint Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">
                {lang === "ar"
                  ? "إرسال رسالة، شكوى أو طلب دعم"
                  : "Submit Inquiry, Complaint or Support Request"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "ar"
                  ? "تصل تذكرتك مباشرة إلى مدير الموقع وفريق خدمة العملاء."
                  : "Your ticket is routed directly to our Site Admin & Customer Care queue."}
              </p>
            </div>
            <MessageSquareWarning className="w-5 h-5 text-[#1B5E7A]" />
          </div>

          {!user && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {lang === "ar"
                  ? "سجّل دخولك أولاً لتقديم التذكرة ومتابعة رد الإدارة عليها لحظياً."
                  : "Sign in to submit your ticket and track live admin replies."}
              </p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="h-10 px-4 rounded-xl bg-[#1B5E7A] hover:bg-[#134459] text-white text-xs font-bold inline-flex items-center gap-2 shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === "ar" ? "نوع الطلب" : "Ticket Category"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "inquiry", ar: "استفسار عام", en: "Inquiry" },
                    { id: "complaint", ar: "شكوى", en: "Complaint" },
                    { id: "support", ar: "دعم فني / حجز", en: "Support" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`h-10 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      category === item.id
                        ? "bg-[#1B5E7A] text-white border-[#1B5E7A]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {lang === "ar" ? item.ar : item.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={lang === "ar" ? "الاسم" : "Your name"}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar" ? "رقم الموبايل (اختياري)" : "Mobile (Optional)"}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === "ar" ? "عنوان الموضوع" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "مثال: استفسار عن باقة الشركات الناشئة أو شكوى حجز"
                    : "e.g. Startup team package question or booking issue"
                }
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === "ar" ? "التفاصيل" : "Message Details"}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "اشرح استفسارك أو شكواك بالتفصيل وسيتواصل معك فريقنا..."
                    : "Describe your inquiry or complaint in detail..."
                }
                className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                required
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-xl bg-[#F4B41A] hover:bg-[#DFA00D] disabled:opacity-60 text-slate-900 font-extrabold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? lang === "ar"
                    ? "جارٍ الإرسال..."
                    : "Submitting..."
                  : lang === "ar"
                    ? "إرسال التذكرة لخدمة العملاء"
                    : "Submit Support Ticket"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* User's Submitted Tickets & Admin Replies */}
      {user && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-lg text-slate-900">
              {lang === "ar"
                ? `تذاكري وشكاواي السابقة (${supportTickets.length})`
                : `My Support Tickets & Replies (${supportTickets.length})`}
            </h2>
          </div>

          {supportTickets.length === 0 ? (
            <p className="text-sm text-slate-500">
              {lang === "ar"
                ? "لم تقم بإرسال أي تذاكر أو شكاوى بعد."
                : "You have not submitted any tickets yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {supportTickets.map((t) => (
                <article
                  key={t.id}
                  className="rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="font-mono text-[#1B5E7A] tabular-nums">
                        {t.ticketCode}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">
                        {getCategoryLabel(t.category)}
                      </span>
                    </div>
                    <span
                      className={`font-extrabold ${
                        t.status === "resolved"
                          ? "text-emerald-700"
                          : t.status === "in_progress"
                            ? "text-amber-700"
                            : "text-[#1B5E7A]"
                      }`}
                    >
                      {getStatusLabel(t.status)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {t.subject}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.message}
                  </p>

                  {t.adminReply && (
                    <div className="rounded-xl bg-[#E6F5F3] border border-[#3A9D8F]/30 p-3.5 space-y-1">
                      <div className="text-xs font-extrabold text-[#1B5E7A] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3A9D8F]" />
                        <span>
                          {lang === "ar"
                            ? "رد إدارة ميدان هب:"
                            : "Meedan Hub Admin Reply:"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800">{t.adminReply}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
