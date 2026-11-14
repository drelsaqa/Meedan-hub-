import { useEffect, useState, MouseEvent } from "react";
import {
  Menu,
  X,
  Globe,
  UserCircle2,
  QrCode,
  GraduationCap,
  Users,
  Calendar,
  Headset,
  LayoutDashboard,
} from "lucide-react";
import meedanLogo from "../assets/images/meedan-logo.jpg";
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

interface NavItem {
  page: AppPage;
  ar: string;
  en: string;
  icon: typeof QrCode;
}

const PRIMARY_SECTIONS: NavItem[] = [
  { page: "booking", ar: "الحجز", en: "Booking", icon: QrCode },
  { page: "academy", ar: "الأكاديمية", en: "Academy", icon: GraduationCap },
  { page: "mentorship", ar: "الإرشاد", en: "Mentorship", icon: Users },
  { page: "events", ar: "الفعاليات", en: "Events", icon: Calendar },
];

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

  const memberLabel =
    preferences?.displayName?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    (lang === "ar" ? "حسابي" : "Account");

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const handleNavClick = (
    e: MouseEvent<HTMLAnchorElement>,
    page: AppPage
  ) => {
    // Allow standard middle-click / Ctrl+click / Cmd+click new-tab navigation
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-[72px] flex items-center justify-between gap-6">
          {/* Zone 1: Single-line Brand Lockup with Official Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            aria-current={activePage === "home" ? "page" : undefined}
            className="flex items-center gap-2.5 text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] rounded-lg"
          >
            <span className="h-11 sm:h-12 px-1.5 py-0.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={meedanLogo}
                alt={lang === "ar" ? "شعار ميدان هب" : "Meedan Hub Logo"}
                className="h-full w-auto object-contain"
              />
            </span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1B5E7A]">
              {lang === "ar" ? "ميدان هب" : "Meedan Hub"}
            </span>
          </a>

          {/* Zone 2: Direct Smooth Navigation for the 4 Main Sections + Support */}
          <nav
            aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}
            className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-700"
          >
            {PRIMARY_SECTIONS.map((link) => {
              const active = activePage === link.page;
              const Icon = link.icon;
              return (
                <a
                  key={link.page}
                  href={`#${link.page}`}
                  onClick={(e) => handleNavClick(e, link.page)}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-b-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                    active
                      ? "bg-[#E6F5F3]/70 border-[#1B5E7A] text-[#1B5E7A] font-bold"
                      : "border-transparent text-slate-700 hover:bg-slate-50 hover:border-[#3A9D8F]/60 hover:text-[#1B5E7A]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? "text-[#1B5E7A]" : "text-[#3A9D8F]"
                    }`}
                  />
                  <span>{lang === "ar" ? link.ar : link.en}</span>
                </a>
              );
            })}

            <span
              aria-hidden="true"
              className="mx-1 h-4 w-px bg-slate-200 shrink-0"
            />

            <a
              href="#support"
              onClick={(e) => handleNavClick(e, "support")}
              aria-current={activePage === "support" ? "page" : undefined}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border-b-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                activePage === "support"
                  ? "bg-slate-100 border-[#1B5E7A] text-[#1B5E7A] font-bold"
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-[#1B5E7A]"
              }`}
            >
              <Headset className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              <span>{lang === "ar" ? "خدمة العملاء" : "Support"}</span>
            </a>

            {isAdmin && (
              <a
                href="#admin"
                onClick={(e) => handleNavClick(e, "admin")}
                aria-current={activePage === "admin" ? "page" : undefined}
                className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border-b-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                  activePage === "admin"
                    ? "bg-amber-50 border-[#F4B41A] text-[#1B5E7A] font-extrabold"
                    : "border-transparent text-[#3A9D8F] hover:bg-slate-50 hover:border-[#3A9D8F]"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === "ar" ? "لوحة المدير" : "Admin"}</span>
              </a>
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
        <nav
          aria-label={
            lang === "ar" ? "قائمة التنقل للجوال" : "Mobile navigation"
          }
          className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg"
        >
          <div className="grid grid-cols-2 gap-2">
            {PRIMARY_SECTIONS.map((link) => {
              const active = activePage === link.page;
              const Icon = link.icon;
              return (
                <a
                  key={link.page}
                  href={`#${link.page}`}
                  onClick={(e) => handleNavClick(e, link.page)}
                  aria-current={active ? "page" : undefined}
                  className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#E6F5F3] border-[#1B5E7A] text-[#1B5E7A]"
                      : "bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[#1B5E7A]" : "text-[#3A9D8F]"
                    }`}
                  />
                  <span>{lang === "ar" ? link.ar : link.en}</span>
                </a>
              );
            })}
          </div>

          <a
            href="#support"
            onClick={(e) => handleNavClick(e, "support")}
            aria-current={activePage === "support" ? "page" : undefined}
            className={`min-h-[44px] flex items-center gap-2.5 w-full text-start py-2.5 px-3 rounded-xl text-sm font-bold transition-colors ${
              activePage === "support"
                ? "bg-slate-100 text-[#1B5E7A]"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Headset className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{lang === "ar" ? "خدمة العملاء" : "Support"}</span>
          </a>

          {isAdmin && (
            <a
              href="#admin"
              onClick={(e) => handleNavClick(e, "admin")}
              aria-current={activePage === "admin" ? "page" : undefined}
              className={`min-h-[44px] flex items-center gap-2.5 w-full text-start py-2.5 px-3 rounded-xl text-sm font-bold transition-colors ${
                activePage === "admin"
                  ? "bg-amber-50 text-[#1B5E7A]"
                  : "text-[#1B5E7A] hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#F4B41A] shrink-0" />
              <span>
                {lang === "ar" ? "لوحة تحكم المدير" : "Admin Dashboard"}
              </span>
            </a>
          )}

          {user ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAccount();
              }}
              className="w-full text-center py-3 px-4 rounded-xl bg-[#1B5E7A] text-white text-sm font-bold mt-2"
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
              className="w-full text-center py-3 px-4 rounded-xl bg-[#1B5E7A] text-white text-sm font-bold mt-2"
            >
              {lang === "ar"
                ? "تسجيل الدخول / حساب جديد"
                : "Sign In / Sign Up"}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
