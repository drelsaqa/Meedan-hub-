import { useState } from "react";
import { QrCode, Sparkles, Wifi, Zap, MapPin, Building2 } from "lucide-react";
import { IMAGES, Lang } from "../data/meedanData";

interface HeroSectionProps {
  lang: Lang;
  availableDesks: number;
  onOpenAssistant: () => void;
}

export function HeroSection({
  lang,
  availableDesks,
  onOpenAssistant,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  const stats = [
    {
      value: "50",
      ar: "مكتب عمل مريح ومجهز",
      en: "Ergonomic Hot Desks",
    },
    {
      value: "2 + 2",
      ar: "قاعات تدريب وغرف اجتماعات",
      en: "Training Halls & Meeting Rooms",
    },
    {
      value: "4",
      ar: "مسارات تدريبية معتمدة",
      en: "Accredited Learning Tracks",
    },
    {
      value: "40",
      ar: "ساعة إرشاد مجانية شهرياً",
      en: "Free Mentorship Hours / Mo",
    },
  ];

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* 2-Column Editorial Hero Split */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Text & Primary Action Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              {/* Unboxed Institutional Attribution (No Pill Capsules) */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-[#1B5E7A]">
                <span>
                  {lang === "ar"
                    ? "مبادرة مؤسسة رواد للابتكار والأثر"
                    : "Rowad Foundation for Innovation & Impact"}
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="text-[#3A9D8F]">
                  {lang === "ar" ? "بالتعاون مع ITIDA TIEC" : "In partnership with ITIDA TIEC"}
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="text-slate-600 tabular-nums">
                  {lang === "ar" ? "القاهرة 400 م²" : "Cairo 400 m²"}
                </span>
              </div>

              <h1
                className="font-black text-slate-900 leading-[1.2] tracking-tight"
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 3.25rem)",
                  textWrap: "balance",
                }}
              >
                {lang === "ar"
                  ? "مساحتك الاحترافية للعمل الحر والابتكار.. بدون انقطاع وبأقل من 40% من التكلفة"
                  : "Uninterrupted Coworking & Career Learning in Cairo at 40%+ Lower Cost"}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {lang === "ar"
                  ? "وداعاً لانقطاع الكهرباء وضعف الإنترنت وتكاليف المكاتب الباهظة. نوفر للمستقلين والشركات الناشئة بيئة عمل بطاقة احتياطية 100%، إنترنت فايبر مزدوج، وتدريب عملي معتمد يؤهلك لسوق العمل العالمي."
                  : "Built for Cairo freelancers, early-stage founders, and graduates: dual-fiber 200+ Mbps internet, 3-hour central UPS power, ergonomic desks, and accredited training tracks."}
              </p>

              {/* Primary CTA + Secondary Assistant Action */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#booking"
                  className="h-12 px-6 rounded-xl bg-[#F4B41A] hover:bg-[#DFA00D] text-slate-900 font-extrabold text-sm sm:text-base inline-flex items-center gap-2.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A]"
                >
                  <QrCode className="w-5 h-5" />
                  <span>
                    {lang === "ar" ? "احجز مساحتك الآن" : "Book Your Desk"}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#E6F5F3] hover:border-[#3A9D8F] text-[#1B5E7A] font-bold text-sm sm:text-base inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A]"
                >
                  <Sparkles className="w-4 h-4 text-[#3A9D8F]" />
                  <span>
                    {lang === "ar"
                      ? "المساعد المهني الذكي"
                      : "Smart Career Advisor"}
                  </span>
                </button>
              </div>
            </div>

            {/* Live Facility Telemetry Row (Unboxed, High-Contrast, Accessible) */}
            <div className="pt-6 border-t border-slate-200 grid sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-[#3A9D8F] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    200+ Mbps
                  </div>
                  <div className="text-slate-500">
                    {lang === "ar"
                      ? "فايبر مزدوج بتبديل تلقائي"
                      : "Dual fiber auto-failover"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-[#F4B41A] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    {lang === "ar" ? "3 ساعات UPS" : "3h Central UPS"}
                  </div>
                  <div className="text-slate-500">
                    {lang === "ar"
                      ? "طاقة احتياطية 100%"
                      : "Zero power downtime"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1B5E7A] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    {availableDesks} / 50
                  </div>
                  <div className="text-slate-500">
                    {lang === "ar"
                      ? "مكاتب متاحة الآن"
                      : "Desks open right now"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Photography Column */}
          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              {!imgError ? (
                <img
                  src={IMAGES.hero}
                  alt={
                    lang === "ar"
                      ? "مساحة العمل المشتركة في ميدان هب بالقاهرة"
                      : "Meedan Hub Cairo coworking and training facility"
                  }
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1B5E7A] to-[#3A9D8F] flex flex-col items-center justify-center text-white p-8 text-center">
                  <Building2 className="w-12 h-12 mb-3 opacity-80" />
                  <p className="font-bold text-lg">
                    {lang === "ar"
                      ? "ميدان هب · القاهرة"
                      : "Meedan Hub · Cairo"}
                  </p>
                </div>
              )}

              {/* Contrast Scrim & Architectural Caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {lang === "ar"
                        ? "وسط البلد · القاهرة · مفتوح يومياً 9 ص – 11 م"
                        : "Downtown Cairo · Open Daily 9 AM – 11 PM"}
                    </div>
                    <div className="text-base sm:text-lg font-extrabold mt-0.5">
                      {lang === "ar"
                        ? "400 م² مصممة للإنتاجية والتعلم التطبيقي"
                        : "400 m² Engineered for Deep Work & Applied Learning"}
                    </div>
                  </div>
                  <div className="text-xs font-mono tabular-nums bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/25">
                    {lang === "ar" ? "بدءاً من 50 ج.م / يوم" : "From 50 EGP / day"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Facility Spec Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div key={item.value} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#1B5E7A] tabular-nums">
                {item.value}
              </div>
              <div className="text-sm font-semibold text-slate-600">
                {lang === "ar" ? item.ar : item.en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
