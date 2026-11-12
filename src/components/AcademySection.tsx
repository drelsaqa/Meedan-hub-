import { useState, type FormEvent } from "react";
import { ArrowUpRight, BookOpen, Check, X } from "lucide-react";
import { AcademyTrack, IMAGES, Lang } from "../data/meedanData";

interface AcademySectionProps {
  lang: Lang;
  tracks: AcademyTrack[];
  enrolledTrackIds: Set<string>;
  onEnroll: (trackId: string, applicantName: string) => void;
}

export function AcademySection({
  lang,
  tracks,
  enrolledTrackIds,
  onEnroll,
}: AcademySectionProps) {
  const [activeTrack, setActiveTrack] = useState<AcademyTrack | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantError, setApplicantError] = useState<string | null>(null);

  const handleEnrollSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTrack) return;

    if (applicantName.trim().length < 3) {
      setApplicantError(
        lang === "ar"
          ? "يرجى إدخال الاسم الكامل."
          : "Please enter your full name."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail.trim())) {
      setApplicantError(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    onEnroll(activeTrack.id, applicantName.trim());
    setApplicantName("");
    setApplicantEmail("");
    setApplicantError(null);
    setActiveTrack(null);
  };

  return (
    <section
      id="academy"
      className="py-16 sm:py-20 bg-white border-y border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs sm:text-sm font-bold text-[#3A9D8F]">
              {lang === "ar"
                ? "أكاديمية ميدان بالتعاون مع ITIDA TIEC"
                : "Meedan Academy · ITIDA TIEC & Rowad"}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {lang === "ar"
                ? "4 مسارات تدريبية معتمدة لسوق العمل العالمي"
                : "4 Accredited Tracks Built for Global Remote Careers"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              {lang === "ar"
                ? "برامج مكثفة مدعومة بنسبة تصل إلى 80% للخريجين والشباب في قاعات مجهزة بشاشات 4K ومشاريع تطبيقية حقيقية."
                : "Up to 80% subsidized cohort programs hosted in our soundproof 4K training studios, culminating in live portfolio demos."}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 sm:h-56 bg-slate-100">
              <img
                src={IMAGES.training}
                alt={
                  lang === "ar"
                    ? "قاعة التدريب التفاعلية في ميدان هب"
                    : "Meedan Hub acoustic training studio"
                }
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4 Tracks Asymmetric Editorial Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {tracks.map((track) => {
            const enrolled = enrolledTrackIds.has(track.id);
            return (
              <article
                key={track.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-7 flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  {/* Clean Unboxed Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 tabular-nums">
                    <span className="font-mono font-bold text-[#1B5E7A]">
                      {track.index}.
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {lang === "ar" ? track.partner.ar : track.partner.en}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {lang === "ar" ? track.duration.ar : track.duration.en}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {track.seatsLeft}{" "}
                      {lang === "ar" ? "مقاعد متبقية" : "seats left"}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {lang === "ar" ? track.title.ar : track.title.en}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang === "ar" ? track.summary.ar : track.summary.en}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-[#1B5E7A] tabular-nums">
                    {track.feeEgp === 0
                      ? lang === "ar"
                        ? "مجاني للأعضاء"
                        : "Free for Members"
                      : `${track.feeEgp} ${lang === "ar" ? "ج.م (مدعوم)" : "EGP (Subsidized)"}`}
                  </div>

                  <button
                    type="button"
                    disabled={enrolled}
                    onClick={() => {
                      setActiveTrack(track);
                      setApplicantError(null);
                    }}
                    className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                      enrolled
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                        : "bg-[#1B5E7A] hover:bg-[#134459] text-white"
                    }`}
                  >
                    {enrolled ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>
                          {lang === "ar" ? "تم تسجيل مقعدك" : "Seat Reserved"}
                        </span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {lang === "ar"
                            ? "استعراض المنهج والتسجيل"
                            : "Syllabus & Apply"}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Syllabus & Track Application Modal */}
      {activeTrack && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#3A9D8F]">
                  {lang === "ar"
                    ? activeTrack.partner.ar
                    : activeTrack.partner.en}{" "}
                  ·{" "}
                  {lang === "ar"
                    ? activeTrack.duration.ar
                    : activeTrack.duration.en}
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {lang === "ar" ? activeTrack.title.ar : activeTrack.title.en}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrack(null)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-xs font-extrabold text-slate-800">
                {lang === "ar" ? "محاور المسار التدريبي:" : "Curriculum Modules:"}
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {(lang === "ar"
                  ? activeTrack.syllabus.ar
                  : activeTrack.syllabus.en
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#1B5E7A] tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder={
                    lang === "ar" ? "اكتب اسمك الثلاثي" : "Your full name"
                  }
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              {applicantError && (
                <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  {applicantError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTrack(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#F4B41A] hover:bg-[#DFA00D] text-slate-900 text-xs sm:text-sm font-extrabold"
                >
                  {lang === "ar" ? "حجز مقعد في الدفعة" : "Reserve Cohort Seat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
