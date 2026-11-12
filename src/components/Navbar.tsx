import { useState } from "react";
import { Menu, X, Globe, ShieldCheck, UserCircle2 } from "lucide-react";
import { Lang } from "../data/meedanData";
import { useAuth } from "../context/AuthContext";
import { AppPage } from "./PageHeaderBar";

interface NavbarProps {
  lang: Lang;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onToggleLang: () => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
}

export function Navbar({
  lang,
  activePage,
  onNavigate,
  onToggleLang,
  onOpenAuth,
  onOpenAccount,
}: NavbarProps) {
  const { user, isAdmin, preferences } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: { page: AppPage; ar: string; en: string }[] = [
    { page: "booking", ar: "المساحات", en: "Spaces" },
    { page: "academy", ar: "الأكاديمية", en: "Academy" },
    { page: "mentorship", ar: "الإرشاد", en: "Mentorship" },
    { page: "events", ar: "الفعاليات", en: "Events" },
    { page: "support", ar: "خدمة العملاء", en: "Support" },
  ];

  const memberLabel =
    preferences?.displayName?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    (lang === "ar" ? "حسابي" : "Account");

  const handleLinkClick = (page: AppPage) => {
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-[72px] flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleLinkClick("home")}
            className="flex items-center gap-2.5 text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] rounded-lg"
          >
            <span className="w-9 h-9 rounded-xl bg-[#1B5E7A] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#F4B41A]" />
            </span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1B5E7A]">
              {lang === "ar" ? "ميدان هب" : "Meedan Hub"}
            </span>
          </button>

          {/* Zone 2: 5 Clean Single-Line Page Links */}
          <nav
            aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700"
          >
            {navLinks.map((link) => {
              const active = activePage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleLinkClick(link.page)}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] rounded-sm ${
                    active
                      ? "border-[#1B5E7A] text-[#1B5E7A] font-bold"
                      : "border-transparent hover:border-[#3A9D8F] hover:text-[#1B5E7A]"
                  }`}
                >
                  {lang === "ar" ? link.ar : link.en}
                </button>
              );
            })}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleLinkClick("admin")}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] rounded-sm ${
                  activePage === "admin"
                    ? "border-[#F4B41A] text-[#1B5E7A] font-extrabold"
                    : "border-transparent text-[#3A9D8F] hover:border-[#3A9D8F]"
                }`}
              >
                {lang === "ar" ? "لوحة المدير" : "Admin"}
              </button>
            )}
          </nav>

          {/* Zone 3: Language Switch + Member Auth/Account Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleLang}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A]"
              aria-label={
                lang === "ar" ? "Switch to English" : "التبديل إلى العربية"
              }
            >
              <Globe className="w-3.5 h-3.5 text-[#1B5E7A]" />
              <span>{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={onOpenAccount}
                className="hidden sm:inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#1B5E7A] hover:bg-[#134459] text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B41A]"
              >
                <UserCircle2 className="w-4 h-4 text-[#F4B41A]" />
                <span className="max-w-[110px] truncate">{memberLabel}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#1B5E7A] hover:bg-[#134459] text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B41A]"
              >
                <UserCircle2 className="w-4 h-4 text-[#F4B41A]" />
                <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden h-11 w-11 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50"
              aria-label={lang === "ar" ? "القائمة" : "Menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.page}
              type="button"
              onClick={() => handleLinkClick(link.page)}
              className="w-full text-start py-2.5 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              {lang === "ar" ? link.ar : link.en}
            </button>
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleLinkClick("admin")}
              className="w-full text-start py-2.5 px-3 rounded-lg text-sm font-bold text-[#1B5E7A] hover:bg-slate-50"
            >
              {lang === "ar" ? "لوحة تحكم المدير" : "Admin Dashboard"}
            </button>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAccount();
              }}
              className="w-full text-center py-3 px-4 rounded-lg bg-[#1B5E7A] text-white text-sm font-bold mt-2"
            >
              {lang === "ar"
                ? `حسابي (${memberLabel})`
                : `My Account (${memberLabel})`}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAuth();
              }}
              className="w-full text-center py-3 px-4 rounded-lg bg-[#1B5E7A] text-white text-sm font-bold mt-2"
            >
              {lang === "ar"
                ? "تسجيل الدخول / حساب جديد"
                : "Sign In / Sign Up"}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
