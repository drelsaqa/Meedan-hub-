import { useState, useEffect, type FormEvent } from "react";
import QRCode from "qrcode";
import {
  X,
  LogOut,
  History,
  SlidersHorizontal,
  GraduationCap,
  Download,
  Trash2,
  Check,
  QrCode,
} from "lucide-react";
import { Lang } from "../data/meedanData";
import { ActivitySummary } from "./ActivitySummary";
import {
  BookingRecord,
  PreferredTier,
  PreferredZone,
  useAuth,
} from "../context/AuthContext";

interface MemberAccountModalProps {
  lang: Lang;
  open: boolean;
  onClose: () => void;
  onChangeLang: (nextLang: Lang) => void;
  onNotify: (text: string, variant?: "success" | "info") => void;
}

type AccountTab = "history" | "preferences" | "activity";

export function MemberAccountModal({
  lang,
  open,
  onClose,
  onChangeLang,
  onNotify,
}: MemberAccountModalProps) {
  const {
    user,
    preferences,
    privateInfo,
    bookings,
    enrollments,
    mentorBookings,
    eventRsvps,
    savePreferences,
    cancelBooking,
    logout,
  } = useAuth();

  const [tab, setTab] = useState<AccountTab>("history");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLang, setPreferredLang] = useState<Lang>(lang);
  const [preferredZone, setPreferredZone] = useState<PreferredZone>("window");
  const [preferredTier, setPreferredTier] =
    useState<PreferredTier>("freelancer");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [previewQr, setPreviewQr] = useState<{
    passId: string;
    spaceLabel: string;
    qrDataUrl: string;
  } | null>(null);

  useEffect(() => {
    if (preferences) {
      setDisplayName(preferences.displayName);
      setPreferredLang(preferences.preferredLang);
      setPreferredZone(preferences.preferredZone);
      setPreferredTier(preferences.preferredTier);
    }
    if (privateInfo) {
      setPhone(privateInfo.phone || "");
    }
  }, [preferences, privateInfo, open]);

  if (!open || !user) return null;

  const handleSavePrefs = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingPrefs(true);
    try {
      await savePreferences(
        {
          displayName: displayName.trim(),
          preferredLang,
          preferredZone,
          preferredTier,
        },
        phone
      );
      onChangeLang(preferredLang);
      onNotify(
        preferredLang === "ar"
          ? "تم حفظ تفضيلاتك الشخصية بنجاح."
          : "Your preferences have been saved.",
        "success"
      );
    } catch {
      onNotify(
        lang === "ar"
          ? "تعذر حفظ التفضيلات، يرجى المحاولة مرة أخرى."
          : "Could not save preferences. Please try again.",
        "info"
      );
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleShowQr = async (booking: BookingRecord) => {
    const qrPayload = JSON.stringify({
      hub: "Meedan Hub Cairo",
      passId: booking.passId,
      space: booking.spaceId,
      date: booking.date,
      slot: booking.timeSlot,
      egp: booking.totalEgp,
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    });
    setPreviewQr({
      passId: booking.passId,
      spaceLabel: booking.spaceLabel,
      qrDataUrl,
    });
  };

  const handleCancelBooking = async (booking: BookingRecord) => {
    try {
      await cancelBooking(booking);
      onNotify(
        lang === "ar"
          ? `تم إلغاء الحجز ${booking.passId} وإتاحة المساحة ${booking.spaceId}.`
          : `Booking ${booking.passId} cancelled and space ${booking.spaceId} released.`,
        "info"
      );
    } catch {
      onNotify(
        lang === "ar"
          ? "تعذر إلغاء الحجز حالياً."
          : "Unable to cancel booking right now.",
        "info"
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    onNotify(
      lang === "ar"
        ? "تم تسجيل خروجك بنجاح."
        : "You have been logged out.",
      "info"
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === "ar" ? "حساب العضو" : "Member Account"}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-900 truncate">
              {preferences?.displayName || user.displayName || "Member"}
            </h3>
            <p className="text-xs text-slate-500 truncate" dir="ltr">
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "خروج" : "Log Out"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-4 border-b border-slate-200 flex gap-2 overflow-x-auto">
          {(
            [
              {
                id: "history",
                icon: History,
                ar: `سجل الحجوزات (${bookings.length})`,
                en: `Booking History (${bookings.length})`,
              },
              {
                id: "preferences",
                icon: SlidersHorizontal,
                ar: "التفضيلات المحفوظة",
                en: "Saved Preferences",
              },
              {
                id: "activity",
                icon: GraduationCap,
                ar: "الأكاديمية والإرشاد",
                en: "Learning & Events",
              },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors ${
                  active
                    ? "border-[#1B5E7A] text-[#1B5E7A]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === "ar" ? item.ar : item.en}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {tab === "history" && (
            <div className="space-y-5">
              <ActivitySummary
                lang={lang}
                bookings={bookings}
                eventRsvps={eventRsvps}
              />

              {previewQr && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={previewQr.qrDataUrl}
                    alt={previewQr.passId}
                    className="w-32 h-32 rounded-lg bg-white p-1.5 border border-slate-200"
                  />
                  <div className="flex-1 space-y-1.5 text-center sm:text-start">
                    <div className="text-xs font-mono font-bold text-[#3A9D8F]">
                      {previewQr.passId}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {previewQr.spaceLabel}
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                      <a
                        href={previewQr.qrDataUrl}
                        download={`${previewQr.passId}.png`}
                        className="h-8 px-3 rounded-lg bg-[#1B5E7A] text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "تحميل QR" : "Download"}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewQr(null)}
                        className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
                      >
                        {lang === "ar" ? "إغلاق" : "Hide"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {bookings.length === 0 ? (
                <div className="text-center py-10 space-y-2 border border-dashed border-slate-200 rounded-xl">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">
                    {lang === "ar"
                      ? "لا توجد حجوزات محفوظة بعد"
                      : "No saved bookings yet"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lang === "ar"
                      ? "احجز مكتباً أو قاعة من المخطط التفاعلي وسيظهر تصريحك هنا."
                      : "Book any desk or room on the floor map to save your QR pass here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold">
                          <span className="text-[#1B5E7A]">{b.passId}</span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={
                              b.status === "confirmed"
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }
                          >
                            {b.status === "confirmed"
                              ? lang === "ar"
                                ? "مؤكد"
                                : "Confirmed"
                              : lang === "ar"
                                ? "ملغي"
                                : "Cancelled"}
                          </span>
                        </div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {b.spaceLabel}
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {b.date} · {b.totalEgp}{" "}
                          {lang === "ar" ? "ج.م" : "EGP"}
                        </div>
                      </div>

                      {b.status === "confirmed" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleShowQr(b)}
                            className="h-9 px-3 rounded-lg bg-[#E6F5F3] text-[#1B5E7A] hover:bg-[#3A9D8F] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>
                              {lang === "ar" ? "عرض QR" : "QR Pass"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b)}
                            className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إلغاء" : "Cancel"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "preferences" && (
            <form onSubmit={handleSavePrefs} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "ar" ? "الاسم المعروض" : "Display Name"}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "ar"
                      ? "رقم الواتساب المحفوظ"
                      : "Saved Mobile / WhatsApp"}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "ar" ? "اللغة المفضلة" : "Preferred Language"}
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value as Lang)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="ar">العربية (RTL)</option>
                    <option value="en">English (LTR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "ar" ? "منطقة الجلوس المفضلة" : "Preferred Zone"}
                  </label>
                  <select
                    value={preferredZone}
                    onChange={(e) =>
                      setPreferredZone(e.target.value as PreferredZone)
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="window">
                      {lang === "ar"
                        ? "منطقة النافذة (D01-D15)"
                        : "Window Daylight (D01-D15)"}
                    </option>
                    <option value="collab">
                      {lang === "ar"
                        ? "المنطقة التفاعلية (D16-D35)"
                        : "Collaborative (D16-D35)"}
                    </option>
                    <option value="quiet">
                      {lang === "ar"
                        ? "التركيز العميق (D36-D50)"
                        : "Quiet Deep-Work (D36-D50)"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === "ar" ? "فئة العضوية" : "Member Tier"}
                  </label>
                  <select
                    value={preferredTier}
                    onChange={(e) =>
                      setPreferredTier(e.target.value as PreferredTier)
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="freelancer">
                      {lang === "ar" ? "مستقل" : "Freelancer"}
                    </option>
                    <option value="student">
                      {lang === "ar" ? "طالب / خريج (-30%)" : "Student (-30%)"}
                    </option>
                    <option value="startup">
                      {lang === "ar" ? "شركة ناشئة" : "Startup Team"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="h-10 px-5 rounded-xl bg-[#1B5E7A] hover:bg-[#134459] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {savingPrefs
                      ? lang === "ar"
                        ? "جارٍ الحفظ..."
                        : "Saving..."
                      : lang === "ar"
                        ? "حفظ التفضيلات"
                        : "Save Preferences"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {tab === "activity" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-500">
                  {lang === "ar"
                    ? "المسارات التدريبية المسجلة"
                    : "Enrolled Academy Tracks"}
                </h4>
                {enrollments.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {lang === "ar"
                      ? "لم تسجل في أي مسار تدريبي بعد."
                      : "No academy track enrollments yet."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {enrollments.map((enr) => (
                      <li
                        key={enr.id}
                        className="rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800"
                      >
                        {enr.trackTitle}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-500">
                  {lang === "ar"
                    ? "جلسات الإرشاد المحجوزة"
                    : "Booked Mentorship Clinics"}
                </h4>
                {mentorBookings.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {lang === "ar"
                      ? "لا توجد جلسات إرشاد محجوزة."
                      : "No mentorship sessions booked yet."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {mentorBookings.map((mb) => (
                      <li
                        key={mb.id}
                        className="rounded-xl border border-slate-200 p-3 space-y-0.5"
                      >
                        <div className="text-sm font-bold text-slate-900">
                          {mb.mentorName} ·{" "}
                          <span className="text-[#3A9D8F]">{mb.slotLabel}</span>
                        </div>
                        <div className="text-xs text-slate-600">{mb.topic}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-500">
                  {lang === "ar"
                    ? "تأكيدات حضور الفعاليات"
                    : "Confirmed Event RSVPs"}
                </h4>
                {eventRsvps.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {lang === "ar"
                      ? "لم تسجل حضورك في فعاليات قادمة بعد."
                      : "No upcoming event RSVPs yet."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {eventRsvps.map((ev) => (
                      <li
                        key={ev.id}
                        className="rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800"
                      >
                        {ev.eventTitle}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
