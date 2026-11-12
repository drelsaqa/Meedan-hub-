import { ShieldCheck } from "lucide-react";
import { Lang } from "../data/meedanData";
import { AppPage } from "./PageHeaderBar";

interface FooterProps {
  lang: Lang;
  onNavigate: (page: AppPage) => void;
  onOpenAssistant: () => void;
}

export function Footer({ lang, onNavigate, onOpenAssistant }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <span className="w-8 h-8 rounded-lg bg-[#1B5E7A] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#F4B41A]" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                {lang === "ar" ? "Meedan Hub | ميدان هب" : "Meedan Hub · Cairo"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              {lang === "ar"
                ? "مبادرة مؤسسة رواد للابتكار والأثر بالتعاون مع هيئة تنمية صناعة تكنولوجيا المعلومات (ITIDA TIEC) — مساحة عمل مشتركة وأكاديمية تعلم مجتمعي بوسط البلد، القاهرة."
                : "An initiative by Rowad Foundation for Innovation & Impact in collaboration with ITIDA TIEC — 400 m² coworking & community learning hub in Downtown Cairo."}
            </p>
          </div>

          <div className="md:col-span-4 space-y-2 text-xs sm:text-sm">
            <div className="font-bold text-white">
              {lang === "ar" ? "الموقع وساعات العمل" : "Location & Hours"}
            </div>
            <div className="text-slate-400">
              {lang === "ar"
                ? "وسط البلد، ممر الابتكار · القاهرة، مصر"
                : "Downtown Innovation Corridor · Cairo, Egypt"}
            </div>
            <div className="text-slate-400 tabular-nums">
              {lang === "ar"
                ? "يومياً من 9:00 صباحاً حتى 11:00 مساءً"
                : "Open Daily: 9:00 AM – 11:00 PM"}
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs sm:text-sm">
            <div className="font-bold text-white">
              {lang === "ar" ? "أقسام الموقع" : "Site Sections"}
            </div>
            <div className="flex flex-col items-start gap-1.5 text-slate-400">
              <button
                type="button"
                onClick={() => onNavigate("booking")}
                className="hover:text-white transition-colors"
              >
                {lang === "ar" ? "حجز مكتبك أو القاعة" : "Space Booking"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("academy")}
                className="hover:text-white transition-colors"
              >
                {lang === "ar" ? "المسارات التدريبية المعتمدة" : "Academy Tracks"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("mentorship")}
                className="hover:text-white transition-colors"
              >
                {lang === "ar" ? "جلسات الإرشاد" : "Mentorship Clinics"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("events")}
                className="hover:text-white transition-colors"
              >
                {lang === "ar" ? "الفاعليات القادمة" : "Upcoming Events"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("support")}
                className="hover:text-white transition-colors"
              >
                {lang === "ar"
                  ? "التواصل والشكاوى وخدمة العملاء"
                  : "Contact & Support"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("admin")}
                className="hover:text-white transition-colors"
              >
                {lang === "ar" ? "لوحة تحكم المدير" : "Admin Dashboard"}
              </button>
              <button
                type="button"
                onClick={onOpenAssistant}
                className="text-start text-[#F4B41A] hover:underline font-semibold"
              >
                {lang === "ar"
                  ? "المساعد المهني الذكي"
                  : "Smart Career Advisor"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            © 2026 Meedan Hub ·{" "}
            {lang === "ar"
              ? "مؤسسة رواد للابتكار والأثر & ITIDA TIEC"
              : "Rowad Foundation & ITIDA TIEC"}
          </span>
          <span>
            {lang === "ar"
              ? "القاهرة · جمهورية مصر العربية"
              : "Cairo · Egypt"}
          </span>
        </div>
      </div>
    </footer>
  );
}
