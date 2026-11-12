import { useState, type FormEvent } from "react";
import { CalendarClock, Check, X } from "lucide-react";
import {
  IMAGES,
  Lang,
  MEMBER_OUTCOMES,
  MENTORS,
  Mentor,
} from "../data/meedanData";

interface MentorshipAndProofSectionProps {
  lang: Lang;
  bookedMentorIds: Set<string>;
  onBookMentor: (mentorId: string, topic: string) => void;
}

type DomainFilter = "all" | Mentor["domain"];

export function MentorshipAndProofSection({
  lang,
  bookedMentorIds,
  onBookMentor,
}: MentorshipAndProofSectionProps) {
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [sessionGoal, setSessionGoal] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredMentors =
    domainFilter === "all"
      ? MENTORS
      : MENTORS.filter((m) => m.domain === domainFilter);

  const handleBookSession = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    if (sessionGoal.trim().length < 5) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى كتابة موضوع الجلسة باختصار."
          : "Please briefly describe your session goal."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail.trim())) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    onBookMentor(selectedMentor.id, sessionGoal.trim());
    setSessionGoal("");
    setVisitorEmail("");
    setErrorMsg(null);
    setSelectedMentor(null);
  };

  const domainFilters: { id: DomainFilter; ar: string; en: string }[] = [
    { id: "all", ar: "كل التخصصات", en: "All" },
    { id: "engineering", ar: "برمجة ومنتجات", en: "Engineering" },
    { id: "design", ar: "تصميم UX", en: "Product & UX" },
    { id: "growth", ar: "نمو وتسويق", en: "Growth" },
    { id: "freelance", ar: "عمل حر وتأسيس", en: "Freelance" },
  ];

  return (
    <section
      id="mentorship"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
    >
      {/* Mentorship Header + Documentary Photo */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
            <img
              src={IMAGES.mentor}
              alt={
                lang === "ar"
                  ? "جلسة إرشاد مهني فردية في ميدان هب"
                  : "1-on-1 mentorship clinic session at Meedan Hub"
              }
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="text-xs sm:text-sm font-bold text-[#3A9D8F]">
              {lang === "ar"
                ? "عيادات الإرشاد المهني المجانية · 40 ساعة شهرياً"
                : "Free Mentorship Clinics · 40 Hours / Month"}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {lang === "ar"
                ? "جلسات إرشاد فردية مع 6 خبراء في الصناعة"
                : "1-on-1 Office Hours with 6 Industry Practitioners"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {lang === "ar"
                ? "احصل على جلسة مراجعة مجانية لمدة 30 دقيقة لمشروعك البرمجي، ملف أعمالك، أو خطة تسعير عقودك مع العملاء الدوليين."
                : "Book a free 30-minute clinic slot to review your system architecture, UX portfolio, USD freelance pricing, or startup pitch."}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-200/75 border border-slate-200 inline-flex">
            {domainFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDomainFilter(item.id)}
                className={`h-9 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  domainFilter === item.id
                    ? "bg-[#1B5E7A] text-white shadow-sm"
                    : "text-slate-700 hover:bg-white/70"
                }`}
              >
                {lang === "ar" ? item.ar : item.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Mentors Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => {
          const isBooked = bookedMentorIds.has(mentor.id);
          return (
            <article
              key={mentor.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-[#3A9D8F]">
                  {lang === "ar" ? mentor.domainLabel.ar : mentor.domainLabel.en}{" "}
                  ·{" "}
                  <span className="text-slate-500">
                    {lang === "ar" ? mentor.nextSlot.ar : mentor.nextSlot.en}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {lang === "ar" ? mentor.name.ar : mentor.name.en}
                </h3>
                <div className="text-xs font-bold text-slate-600">
                  {lang === "ar" ? mentor.role.ar : mentor.role.en}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  {lang === "ar" ? mentor.topics.ar : mentor.topics.en}
                </p>
              </div>

              <button
                type="button"
                disabled={isBooked}
                onClick={() => {
                  setSelectedMentor(mentor);
                  setErrorMsg(null);
                }}
                className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors w-full ${
                  isBooked
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                    : "border border-slate-300 bg-white hover:bg-[#1B5E7A] hover:text-white hover:border-[#1B5E7A] text-slate-800"
                }`}
              >
                {isBooked ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {lang === "ar" ? "تم حجز الجلسة" : "Clinic Slot Booked"}
                    </span>
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-4 h-4" />
                    <span>
                      {lang === "ar"
                        ? "احجز 30 دقيقة مجاناً"
                        : "Book Free 30-Min Slot"}
                    </span>
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>

      {/* Claim-to-Proof Adjacent Member Outcomes */}
      <div className="pt-12 border-t border-slate-200 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs sm:text-sm font-bold text-[#1B5E7A]">
            {lang === "ar" ? "أثر مجتمعي موثق" : "Verified Member Outcomes"}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            {lang === "ar"
              ? "نتائج ملموسة لأعضاء ميدان هب في القاهرة"
              : "Concrete Results Across Cairo's Freelance & Startup Community"}
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {MEMBER_OUTCOMES.map((item) => (
            <blockquote
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-[#3A9D8F] tabular-nums">
                  {lang === "ar" ? item.metric.ar : item.metric.en}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  “{lang === "ar" ? item.quote.ar : item.quote.en}”
                </p>
              </div>
              <footer className="pt-3 border-t border-slate-100">
                <div className="font-extrabold text-sm text-slate-900">
                  {lang === "ar" ? item.name.ar : item.name.en}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {lang === "ar" ? item.role.ar : item.role.en}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>

      {/* Mentor Booking Modal */}
      {selectedMentor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#3A9D8F]">
                  {lang === "ar"
                    ? selectedMentor.nextSlot.ar
                    : selectedMentor.nextSlot.en}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {lang === "ar"
                    ? selectedMentor.name.ar
                    : selectedMentor.name.en}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar"
                    ? "ما الذي تود مناقشته في الجلسة؟"
                    : "What would you like to review?"}
                </label>
                <textarea
                  rows={3}
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: مراجعة ملف أعمالي وخطة التسعير على Upwork"
                      : "e.g. Portfolio review and USD pricing strategy"
                  }
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar" ? "البريد الإلكتروني للتأكيد" : "Confirmation Email"}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              {errorMsg && (
                <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#1B5E7A] hover:bg-[#134459] text-white text-xs sm:text-sm font-extrabold"
                >
                  {lang === "ar" ? "تأكيد الموعد المجاني" : "Confirm Free Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
