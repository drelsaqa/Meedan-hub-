import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  GraduationCap,
  Headset,
  LayoutDashboard,
  MapPin,
  QrCode,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { IMAGES, Lang } from "../data/meedanData";
import { AppPage } from "./PageHeaderBar";

interface HomePageProps {
  lang: Lang;
  availableDesks: number;
  isAdmin: boolean;
  onNavigate: (page: AppPage) => void;
  onOpenAssistant: () => void;
}

export function HomePage({
  lang,
  availableDesks,
  isAdmin,
  onNavigate,
  onOpenAssistant,
}: HomePageProps) {
  const [imgError, setImgError] = useState(false);
  const ForwardArrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const gatewaySections: {
    id: AppPage;
    num: string;
    icon: typeof QrCode;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    metricAr: string;
    metricEn: string;
    ctaAr: string;
    ctaEn: string;
  }[] = [
    {
      id: "booking",
      num: "01.",
      icon: QrCode,
      titleAr: "حجز مكتبك أو القاعة",
      titleEn: "Book Your Desk or Hall",
      descAr:
        "50 مكتباً مريحاً، قاعتا تدريب 4K، غرف اجتماعات وكبائن مكالمات مع تصريح دخول فوري QR Pass.",
      descEn:
        "50 ergonomic desks, 2 soundproof 4K training halls, meeting rooms & call booths with instant QR Pass.",
      metricAr: `${availableDesks} / 50 مكتب متاح الآن`,
      metricEn: `${availableDesks} / 50 desks open now`,
      ctaAr: "احجز مساحتك",
      ctaEn: "Open Booking Map",
    },
    {
      id: "academy",
      num: "02.",
      icon: GraduationCap,
      titleAr: "المسارات التدريبية المعتمدة",
      titleEn: "Accredited Training Tracks",
      descAr:
        "4 مسارات عملية بالتعاون مع ITIDA TIEC ومؤسسة رواد في البرمجة، UX، التسويق والعمل الحر.",
      descEn:
        "4 subsidized ITIDA TIEC & Rowad Foundation tracks in Engineering, UI/UX, Growth & Freelance Export.",
      metricAr: "4 مسارات · دعم حتى 80%",
      metricEn: "4 tracks · up to 80% subsidy",
      ctaAr: "استعرض المناهج",
      ctaEn: "Explore Tracks",
    },
    {
      id: "mentorship",
      num: "03.",
      icon: Users,
      titleAr: "جلسات الإرشاد",
      titleEn: "Mentorship Clinics",
      descAr:
        "احجز جلسة مراجعة مجانية (30 دقيقة) مع 6 خبراء في هندسة البرمجيات، التصميم، والتصدير الرقمي.",
      descEn:
        "Book free 30-min 1-on-1 office hours with 6 senior industry mentors across tech, UX & remote export.",
      metricAr: "6 خبراء · 40 ساعة مجاناً/شهر",
      metricEn: "6 mentors · 40 free hrs/mo",
      ctaAr: "احجز جلسة مجانية",
      ctaEn: "Book Clinic Slot",
    },
    {
      id: "events",
      num: "04.",
      icon: Calendar,
      titleAr: "الفاعليات القادمة",
      titleEn: "Upcoming Events",
      descAr:
        "أيام العرض التجريبي، عيادات التسعير بالدولار، وملتقيات مهندسي الذكاء الاصطناعي بالقاهرة.",
      descEn:
        "Cohort Demo Days, USD pricing workshops, and Cairo Applied AI Builders meetups with free RSVP.",
      metricAr: "3 فعاليات قادمة هذا الشهر",
      metricEn: "3 events this month",
      ctaAr: "تصفح الفاعليات",
      ctaEn: "View Events",
    },
  ];

  return (
    <div className="space-y-0">
      {/* Top 4-Section Service Gateway */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-12 sm:pb-14 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
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
                  {lang === "ar" ? "بالتعاون مع ITIDA TIEC" : "ITIDA TIEC Partner"}
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="text-slate-600 tabular-nums">
                  {lang === "ar" ? "وسط البلد، القاهرة 400 م²" : "Downtown Cairo 400 m²"}
                </span>
              </div>

              <h1
                className="font-black text-slate-900 leading-[1.2] tracking-tight"
                style={{
                  fontSize: "clamp(1.85rem, 3.3vw, 2.85rem)",
                  textWrap: "balance",
                }}
              >
                {lang === "ar"
                  ? "ميدان هب: مساحتك الذكية للعمل والتعلم والإرشاد بدون انقطاع"
                  : "Meedan Hub: Four Integrated Gateways for Cairo's Freelancers & Founders"}
              </h1>
            </div>

            <button
              type="button"
              onClick={onOpenAssistant}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#E6F5F3] hover:border-[#3A9D8F] text-[#1B5E7A] font-bold text-xs sm:text-sm inline-flex items-center gap-2 self-start lg:self-auto whitespace-nowrap shrink-0 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#3A9D8F]" />
              <span>
                {lang === "ar"
                  ? "اسأل المساعد المهني الذكي"
                  : "Ask AI Career Assistant"}
              </span>
            </button>
          </div>

          {/* 4 Clickable Top Sections -> Dedicated Service Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gatewaySections.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onNavigate(sec.id)}
                  className="group text-start rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#1B5E7A] p-6 flex flex-col justify-between gap-6 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A]"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-extrabold text-[#1B5E7A] tabular-nums">
                        {sec.num}
                      </span>
                      <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:bg-[#1B5E7A] group-hover:border-[#1B5E7A] group-hover:text-white text-[#1B5E7A] flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 group-hover:text-[#1B5E7A] transition-colors">
                      {lang === "ar" ? sec.titleAr : sec.titleEn}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {lang === "ar" ? sec.descAr : sec.descEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 w-full space-y-2.5">
                    <div className="text-xs font-bold text-[#3A9D8F] tabular-nums">
                      {lang === "ar" ? sec.metricAr : sec.metricEn}
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#1B5E7A]">
                      <span>{lang === "ar" ? sec.ctaAr : sec.ctaEn}</span>
                      <ForwardArrow className="w-4 h-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architectural Facility Overview + Support & Admin Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              {!imgError ? (
                <img
                  src={IMAGES.hero}
                  alt={
                    lang === "ar"
                      ? "مساحة العمل المشتركة في ميدان هب بالقاهرة"
                      : "Meedan Hub Cairo coworking interior"
                  }
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1B5E7A] to-[#3A9D8F] flex flex-col items-center justify-center text-white p-8">
                  <Building2 className="w-12 h-12 mb-3 opacity-80" />
                  <p className="font-bold">
                    {lang === "ar" ? "ميدان هب · القاهرة" : "Meedan Hub · Cairo"}
                  </p>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs font-semibold text-slate-200">
                  {lang === "ar"
                    ? "وسط البلد، القاهرة · مفتوح يومياً 9 ص – 11 م"
                    : "Downtown Cairo · Open Daily 9 AM – 11 PM"}
                </div>
                <div className="text-lg sm:text-xl font-extrabold mt-0.5">
                  {lang === "ar"
                    ? "بنية تحتية مضمونة بتكلفة أقل بنسبة 40% للمستقلين والشركات الناشئة"
                    : "Zero-Downtime Workspace Infrastructure at 40%+ Lower Cost"}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900">
                {lang === "ar"
                  ? "مواصفات التشغيل المستمر"
                  : "Continuous Operations Guarantee"}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Wifi className="w-4 h-4 text-[#3A9D8F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      200+ Mbps{" "}
                    </span>
                    <span className="text-slate-600">
                      {lang === "ar"
                        ? "إنترنت فايبر مزدوج بتبديل تلقائي"
                        : "Dual fiber internet with auto-failover"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#F4B41A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {lang === "ar" ? "3 ساعات UPS " : "3h Central UPS "}
                    </span>
                    <span className="text-slate-600">
                      {lang === "ar"
                        ? "طاقة احتياطية كاملة بدون انقطاع"
                        : "Full power continuity during grid outages"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1B5E7A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {availableDesks} / 50{" "}
                    </span>
                    <span className="text-slate-600">
                      {lang === "ar"
                        ? "مكتب عمل متاح للحجز الفوري"
                        : "Ergonomic desks ready for instant booking"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Support & Admin Quick Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => onNavigate("support")}
                className="rounded-2xl border border-slate-200 bg-white hover:border-[#3A9D8F] p-5 text-start flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#E6F5F3] text-[#1B5E7A] flex items-center justify-center shrink-0">
                    <Headset className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">
                      {lang === "ar"
                        ? "التواصل والشكاوى وخدمة العملاء"
                        : "Contact, Complaints & Support"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {lang === "ar"
                        ? "تقديم شكوى، استفسار، أو متابعة تذكرتك"
                        : "Submit an inquiry, complaint or track tickets"}
                    </div>
                  </div>
                </div>
                <ForwardArrow className="w-4 h-4 text-[#1B5E7A] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("admin")}
                className="rounded-2xl border border-slate-200 bg-white hover:border-[#1B5E7A] p-5 text-start flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#1B5E7A] flex items-center justify-center shrink-0">
                    <LayoutDashboard className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">
                      {lang === "ar"
                        ? "لوحة تحكم مدير الموقع"
                        : "Site Admin Dashboard"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAdmin
                        ? lang === "ar"
                          ? "إدارة الحجوزات، الشكاوى والتقارير"
                          : "Manage bookings, support tickets & metrics"
                        : lang === "ar"
                          ? "مخصصة لمديري الموقع المصرح لهم"
                          : "Restricted to authorized site administrators"}
                    </div>
                  </div>
                </div>
                <ForwardArrow className="w-4 h-4 text-[#1B5E7A] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
