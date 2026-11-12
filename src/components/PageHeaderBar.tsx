import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Lang } from "../data/meedanData";

export type AppPage =
  | "home"
  | "booking"
  | "academy"
  | "mentorship"
  | "events"
  | "support"
  | "admin";

interface PageHeaderBarProps {
  lang: Lang;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function PageHeaderBar({
  lang,
  activePage,
  onNavigate,
}: PageHeaderBarProps) {
  const serviceTabs: { id: AppPage; ar: string; en: string }[] = [
    { id: "booking", ar: "01. حجز مكتبك أو القاعة", en: "01. Space Booking" },
    { id: "academy", ar: "02. المسارات التدريبية", en: "02. Academy" },
    { id: "mentorship", ar: "03. جلسات الإرشاد", en: "03. Mentorship" },
    { id: "events", ar: "04. الفاعليات القادمة", en: "04. Events" },
  ];

  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <BackArrow className="w-3.5 h-3.5 text-[#1B5E7A]" />
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          {serviceTabs.map((tab) => {
            const active = activePage === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? "bg-[#1B5E7A] text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {lang === "ar" ? tab.ar : tab.en}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
