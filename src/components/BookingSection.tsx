import { useState, useMemo, useEffect, type FormEvent } from "react";
import QRCode from "qrcode";
import {
  Check,
  Lock,
  Monitor,
  Users,
  PhoneCall,
  QrCode,
  Download,
  RotateCcw,
  Calendar,
  Clock,
  Sparkles,
  LogIn,
} from "lucide-react";
import {
  DeskItem,
  Lang,
  SpecialSpace,
  SpaceCategory,
} from "../data/meedanData";
import { PreferredTier, useAuth } from "../context/AuthContext";

interface BookingSectionProps {
  lang: Lang;
  desks: DeskItem[];
  specialSpaces: SpecialSpace[];
  bookedSpecialIds: Set<string>;
  onConfirmBooking: (payload: {
    passId: string;
    spaceId: string;
    spaceLabel: string;
    isDesk: boolean;
    date: string;
    timeSlot: "morning" | "evening" | "fullday";
    tier: PreferredTier;
    totalEgp: number;
    phone: string;
  }) => Promise<void>;
  onOpenAuth: () => void;
}

type FilterTab = "all" | SpaceCategory;
type TimeSlot = "morning" | "evening" | "fullday";

interface GeneratedPass {
  passId: string;
  spaceLabel: string;
  fullName: string;
  phone: string;
  email: string;
  date: string;
  slotLabel: string;
  totalEgp: number;
  qrDataUrl: string;
  savedToAccount: boolean;
}

export function BookingSection({
  lang,
  desks,
  specialSpaces,
  bookedSpecialIds,
  onConfirmBooking,
  onOpenAuth,
}: BookingSectionProps) {
  const { user, preferences, privateInfo } = useAuth();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>("D05");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("fullday");
  const [tier, setTier] = useState<PreferredTier>("freelancer");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generatedPass, setGeneratedPass] = useState<GeneratedPass | null>(
    null
  );

  // Sync saved user preferences & contact info into the booking form
  useEffect(() => {
    if (preferences) {
      setFullName((prev) => prev || preferences.displayName);
      setTier(preferences.preferredTier);
      // Suggest an available desk in the user's preferred zone
      const preferredDesk = desks.find(
        (d) => d.zone === preferences.preferredZone && !d.booked
      );
      if (preferredDesk) {
        setSelectedSpaceId((current) => {
          const currentDesk = desks.find((d) => d.id === current);
          if (!current || currentDesk?.booked) return preferredDesk.id;
          return current;
        });
      }
    }
    if (privateInfo) {
      setEmail((prev) => prev || privateInfo.email);
      if (privateInfo.phone) {
        setPhone((prev) => prev || privateInfo.phone || "");
      }
    } else if (user?.email) {
      setEmail((prev) => prev || user.email || "");
    }
  }, [preferences, privateInfo, user, desks]);

  const selectedDesk = useMemo(
    () => desks.find((d) => d.id === selectedSpaceId) || null,
    [desks, selectedSpaceId]
  );

  const selectedSpecial = useMemo(
    () => specialSpaces.find((s) => s.id === selectedSpaceId) || null,
    [specialSpaces, selectedSpaceId]
  );

  const filteredSpecialSpaces = useMemo(() => {
    if (filter === "desk") return [];
    if (filter === "all") return specialSpaces;
    return specialSpaces.filter((s) => s.category === filter);
  }, [filter, specialSpaces]);

  const showDesks = filter === "all" || filter === "desk";

  const computedPrice = useMemo(() => {
    if (!selectedDesk && !selectedSpecial) return 0;

    if (selectedDesk) {
      const baseDaily = timeSlot === "fullday" ? 50 : 35;
      const discount = tier === "student" ? 0.7 : 1;
      return Math.round(baseDaily * discount);
    }

    if (selectedSpecial) {
      const hours = timeSlot === "fullday" ? 6 : 3;
      const subtotal = selectedSpecial.priceEgp * hours;
      const discount = tier === "student" ? 0.85 : 1;
      return Math.round(subtotal * discount);
    }

    return 0;
  }, [selectedDesk, selectedSpecial, timeSlot, tier]);

  const selectedLabel = useMemo(() => {
    if (selectedDesk) {
      const zoneName =
        selectedDesk.zone === "window"
          ? lang === "ar"
            ? "منطقة النافذة"
            : "Window Focus Zone"
          : selectedDesk.zone === "collab"
            ? lang === "ar"
              ? "المنطقة التفاعلية"
              : "Collaborative Zone"
            : lang === "ar"
              ? "منطقة التركيز الهادئة"
              : "Quiet Deep-Work Zone";
      return lang === "ar"
        ? `مكتب مريح ${selectedDesk.id} · ${zoneName}`
        : `Ergonomic Desk ${selectedDesk.id} · ${zoneName}`;
    }
    if (selectedSpecial) {
      return lang === "ar" ? selectedSpecial.name.ar : selectedSpecial.name.en;
    }
    return null;
  }, [selectedDesk, selectedSpecial, lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedSpaceId || (!selectedDesk && !selectedSpecial)) {
      setFormError(
        lang === "ar"
          ? "يرجى اختيار مكتب أو قاعة من المخطط التفاعلي أولاً."
          : "Please select a desk or room from the floor map first."
      );
      return;
    }

    if (
      selectedDesk?.booked ||
      (selectedSpecial && bookedSpecialIds.has(selectedSpecial.id))
    ) {
      setFormError(
        lang === "ar"
          ? "هذه المساحة محجوزة بالفعل، يرجى اختيار مساحة متاحة."
          : "This space is already booked. Please choose an available option."
      );
      return;
    }

    if (fullName.trim().length < 3) {
      setFormError(
        lang === "ar"
          ? "يرجى إدخال الاسم الكامل (3 أحرف على الأقل)."
          : "Please enter your full name (at least 3 characters)."
      );
      return;
    }

    const phoneClean = phone.trim().replace(/\s+/g, "");
    if (!/^(\+?20|0)?1[0125]\d{8}$/.test(phoneClean) && phoneClean.length < 8) {
      setFormError(
        lang === "ar"
          ? "يرجى إدخال رقم هاتف / واتساب مصري صحيح."
          : "Please enter a valid mobile / WhatsApp number."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    setSubmitting(true);
    const passId = `MH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const slotLabel =
      timeSlot === "morning"
        ? lang === "ar"
          ? "الفترة الصباحية (9 ص – 3 م)"
          : "Morning (9 AM – 3 PM)"
        : timeSlot === "evening"
          ? lang === "ar"
            ? "الفترة المسائية (3 م – 9 م)"
            : "Evening (3 PM – 9 PM)"
          : lang === "ar"
            ? "يوم كامل (9 ص – 9 م)"
            : "Full Day (9 AM – 9 PM)";

    const qrPayload = JSON.stringify({
      hub: "Meedan Hub Cairo",
      passId,
      space: selectedSpaceId,
      name: fullName.trim(),
      date,
      slot: timeSlot,
      egp: computedPrice,
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });

      const spaceTitle = selectedLabel || selectedSpaceId;
      await onConfirmBooking({
        passId,
        spaceId: selectedSpaceId,
        spaceLabel: spaceTitle,
        isDesk: Boolean(selectedDesk),
        date,
        timeSlot,
        tier,
        totalEgp: computedPrice,
        phone: phoneClean,
      });

      setGeneratedPass({
        passId,
        spaceLabel: spaceTitle,
        fullName: fullName.trim(),
        phone: phoneClean,
        email: email.trim(),
        date,
        slotLabel,
        totalEgp: computedPrice,
        qrDataUrl,
        savedToAccount: Boolean(user),
      });
    } catch {
      setFormError(
        lang === "ar"
          ? "تعذر تأكيد الحجز، يرجى المحاولة مرة أخرى."
          : "Could not complete booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPass = () => {
    if (!generatedPass) return;
    const link = document.createElement("a");
    link.href = generatedPass.qrDataUrl;
    link.download = `${generatedPass.passId}-${selectedSpaceId || "pass"}.png`;
    link.click();
  };

  const renderZoneGroup = (
    zone: DeskItem["zone"],
    titleAr: string,
    titleEn: string,
    rangeText: string
  ) => {
    const zoneDesks = desks.filter((d) => d.zone === zone);
    const isPreferredZone = preferences?.preferredZone === zone;
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
          <span>
            {lang === "ar" ? titleAr : titleEn}
            {isPreferredZone && (
              <span className="ms-2 text-[#3A9D8F]">
                · {lang === "ar" ? "منطقتك المفضلة" : "Preferred Zone"}
              </span>
            )}
          </span>
          <span className="font-mono tabular-nums text-slate-500">
            {rangeText}
          </span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {zoneDesks.map((desk) => {
            const isSelected = selectedSpaceId === desk.id;
            return (
              <button
                key={desk.id}
                type="button"
                disabled={desk.booked}
                onClick={() => {
                  setSelectedSpaceId(desk.id);
                  setGeneratedPass(null);
                  setFormError(null);
                }}
                aria-label={
                  desk.booked
                    ? `${desk.id} ${lang === "ar" ? "محجوز" : "Booked"}`
                    : `${desk.id} ${isSelected ? (lang === "ar" ? "محدد" : "Selected") : lang === "ar" ? "متاح" : "Available"}`
                }
                className={`h-11 rounded-xl border text-xs font-mono font-semibold tabular-nums flex flex-col items-center justify-center gap-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                  desk.booked
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : isSelected
                      ? "bg-[#F4B41A] border-[#DFA00D] text-slate-900 shadow-sm -translate-y-0.5"
                      : "bg-white border-emerald-300 text-slate-800 hover:bg-[#E6F5F3] hover:border-[#3A9D8F]"
                }`}
              >
                <span>{desk.id}</span>
                {desk.booked ? (
                  <Lock className="w-3 h-3 text-slate-400" />
                ) : isSelected ? (
                  <Check className="w-3 h-3 text-slate-900" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const tabs: { id: FilterTab; ar: string; en: string }[] = [
    { id: "all", ar: "الكل", en: "All" },
    { id: "desk", ar: "مكاتب العمل (50)", en: "Desks (50)" },
    { id: "training", ar: "قاعات التدريب (2)", en: "Training (2)" },
    { id: "meeting", ar: "غرف الاجتماعات (2)", en: "Meetings (2)" },
    { id: "pod", ar: "كبائن المكالمات (2)", en: "Call Pods (2)" },
  ];

  return (
    <section
      id="booking"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs sm:text-sm font-bold text-[#3A9D8F]">
            {lang === "ar"
              ? "نظام الدخول الذكي عبر QR Pass"
              : "Instant QR Pass Access System"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {lang === "ar"
              ? "احجز مكتبك أو قاعتك من المخطط التفاعلي"
              : "Interactive 400 m² Space Floor Map"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {lang === "ar"
              ? "اختر المقعد أو القاعة المناسبة، وحدد الفترة الزمنية لاستلام تصريح الدخول الذكي فوراً بتكلفة مدعومة للشباب والمستقلين."
              : "Select an ergonomic desk, soundproof training hall, or acoustic call pod to generate your instant QR entry pass."}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={lang === "ar" ? "تصفية المساحات" : "Filter spaces"}
          className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-200/75 border border-slate-200 self-start"
        >
          {tabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`h-10 px-3.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                  active
                    ? "bg-[#1B5E7A] text-white shadow-sm"
                    : "text-slate-700 hover:bg-white/70"
                }`}
              >
                {lang === "ar" ? tab.ar : tab.en}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {lang === "ar"
                ? "مخطط الطابق الذكي (400 م²)"
                : "Smart Floor Layout (400 m²)"}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border border-emerald-400 bg-white inline-block" />
                <span>{lang === "ar" ? "متاح" : "Available"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border border-[#DFA00D] bg-[#F4B41A] inline-flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-slate-900" />
                </span>
                <span>{lang === "ar" ? "محدد" : "Selected"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border border-slate-200 bg-slate-100 inline-flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span>{lang === "ar" ? "محجوز" : "Booked"}</span>
              </span>
            </div>
          </div>

          {filteredSpecialSpaces.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800">
                {lang === "ar"
                  ? "قاعات التدريب وغرف الاجتماعات وكبائن المكالمات"
                  : "Training Halls, Meeting Rooms & Call Pods"}
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredSpecialSpaces.map((space) => {
                  const isBooked = bookedSpecialIds.has(space.id);
                  const isSelected = selectedSpaceId === space.id;
                  const CategoryIcon =
                    space.category === "training"
                      ? Monitor
                      : space.category === "meeting"
                        ? Users
                        : PhoneCall;

                  return (
                    <button
                      key={space.id}
                      type="button"
                      disabled={isBooked}
                      onClick={() => {
                        setSelectedSpaceId(space.id);
                        setGeneratedPass(null);
                        setFormError(null);
                      }}
                      className={`text-start rounded-xl border p-4 transition-all flex gap-3.5 items-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                        isBooked
                          ? "bg-slate-50 border-slate-200 opacity-65 cursor-not-allowed"
                          : isSelected
                            ? "bg-[#FFFBEB] border-[#F4B41A] ring-1 ring-[#F4B41A]"
                            : "bg-white border-slate-200 hover:border-[#3A9D8F] hover:bg-slate-50/50"
                      }`}
                    >
                      <img
                        src={space.image}
                        alt={lang === "ar" ? space.name.ar : space.name.en}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-extrabold text-sm text-slate-900 truncate">
                            {lang === "ar" ? space.name.ar : space.name.en}
                          </div>
                          <CategoryIcon className="w-4 h-4 text-[#1B5E7A] shrink-0" />
                        </div>

                        <div className="text-xs text-slate-500">
                          {lang === "ar" ? space.zone.ar : space.zone.en} ·{" "}
                          <span className="tabular-nums">
                            {space.capacity}{" "}
                            {lang === "ar" ? "أفراد" : "seats"}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 line-clamp-2">
                          {lang === "ar" ? space.specs.ar : space.specs.en}
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs font-bold">
                          <span className="text-[#1B5E7A] tabular-nums">
                            {space.priceEgp}{" "}
                            {lang === "ar" ? space.unit.ar : space.unit.en}
                          </span>
                          <span
                            className={
                              isBooked
                                ? "text-slate-500"
                                : isSelected
                                  ? "text-amber-700"
                                  : "text-emerald-700"
                            }
                          >
                            {isBooked
                              ? lang === "ar"
                                ? "محجوز"
                                : "Booked"
                              : isSelected
                                ? lang === "ar"
                                  ? "محدد الآن"
                                  : "Selected"
                                : lang === "ar"
                                  ? "متاح للحجز"
                                  : "Available"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showDesks && (
            <div className="space-y-6 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-extrabold text-slate-800">
                  {lang === "ar"
                    ? "منطقة المكاتب المريحة (50 مكتب Ergonomic)"
                    : "Ergonomic Hot Desks Area (50 Desks)"}
                </h4>
                <span className="text-xs font-bold text-[#1B5E7A] tabular-nums">
                  {lang === "ar"
                    ? "50 ج.م / يوم · خصم 30% للطلاب والخريجين"
                    : "50 EGP / day · 30% Student Subsidy"}
                </span>
              </div>

              <div className="space-y-6">
                {renderZoneGroup(
                  "window",
                  "منطقة الإطلالة والإضاءة الطبيعية",
                  "Window Daylight Zone",
                  "D01 – D15"
                )}
                {renderZoneGroup(
                  "collab",
                  "منطقة العمل التفاعلي والفرق الناشئة",
                  "Central Collaborative Zone",
                  "D16 – D35"
                )}
                {renderZoneGroup(
                  "quiet",
                  "منطقة التركيز العميق الصامتة",
                  "Quiet Deep-Work Zone",
                  "D36 – D50"
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Checkout & QR Pass Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                {generatedPass
                  ? lang === "ar"
                    ? "تصريح الدخول الذكي"
                    : "Smart QR Entry Pass"
                  : lang === "ar"
                    ? "تأكيد الحجز السريع"
                    : "Instant Booking"}
              </h3>
              <p className="text-xs text-slate-500">
                {user
                  ? lang === "ar"
                    ? "سيتم حفظ الحجز في سجل حسابك"
                    : "Saved automatically to your account history"
                  : lang === "ar"
                    ? "الدفع عند الوصول أو عبر المحفظة الإلكترونية"
                    : "Pay on arrival or via mobile wallet"}
              </p>
            </div>
            <QrCode className="w-6 h-6 text-[#1B5E7A]" />
          </div>

          {!user && !generatedPass && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#E6F5F3] border border-slate-200 text-xs font-bold text-[#1B5E7A] flex items-center justify-between gap-2 transition-colors"
            >
              <span>
                {lang === "ar"
                  ? "سجل دخولك لحفظ حجوزاتك وتفضيلاتك"
                  : "Sign in to save booking history & preferences"}
              </span>
              <LogIn className="w-4 h-4 shrink-0" />
            </button>
          )}

          {generatedPass ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center space-y-3">
                <div className="text-xs font-mono font-bold text-[#3A9D8F] tabular-nums">
                  {generatedPass.passId}
                </div>
                <img
                  src={generatedPass.qrDataUrl}
                  alt={`QR Pass ${generatedPass.passId}`}
                  className="w-44 h-44 mx-auto rounded-lg border border-slate-200 bg-white p-2"
                />
                <div className="space-y-1">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {generatedPass.spaceLabel}
                  </div>
                  <div className="text-xs text-slate-600">
                    {generatedPass.fullName} · {generatedPass.date}
                  </div>
                  <div className="text-xs text-slate-500">
                    {generatedPass.slotLabel}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">
                    {lang === "ar" ? "الإجمالي المستحق" : "Total Due"}
                  </span>
                  <span className="text-[#1B5E7A] font-mono tabular-nums">
                    {generatedPass.totalEgp}{" "}
                    {lang === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPass}
                  className="h-11 px-4 rounded-xl bg-[#1B5E7A] hover:bg-[#134459] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {lang === "ar"
                      ? "تحميل تصريح QR"
                      : "Download QR Pass"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratedPass(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {lang === "ar" ? "حجز مساحة أخرى" : "Book Another Space"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">
                  {lang === "ar" ? "المساحة المختارة" : "Selected Space"}
                </div>
                <div className="font-extrabold text-sm text-[#1B5E7A] mt-0.5">
                  {selectedLabel ||
                    (lang === "ar"
                      ? "اختر مكتباً أو قاعة من المخطط"
                      : "Select a desk or room on the map")}
                </div>
                {computedPrice > 0 && (
                  <div className="text-xs font-bold text-[#3A9D8F] mt-1 tabular-nums">
                    {computedPrice} {lang === "ar" ? "ج.م" : "EGP"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === "ar" ? "فئة العضوية" : "Member Category"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "freelancer", ar: "مستقل", en: "Freelancer" },
                      { id: "student", ar: "طالب -30%", en: "Student -30%" },
                      { id: "startup", ar: "شركة ناشئة", en: "Startup" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTier(item.id)}
                      className={`h-9 px-2 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                        tier === item.id
                          ? "bg-[#1B5E7A] text-white border-[#1B5E7A]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {lang === "ar" ? item.ar : item.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    <Calendar className="w-3.5 h-3.5 inline me-1 text-slate-400" />
                    {lang === "ar" ? "التاريخ" : "Date"}
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-slot"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    <Clock className="w-3.5 h-3.5 inline me-1 text-slate-400" />
                    {lang === "ar" ? "الفترة" : "Time Slot"}
                  </label>
                  <select
                    id="booking-slot"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                    className="w-full h-10 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  >
                    <option value="fullday">
                      {lang === "ar" ? "يوم كامل (9 ص - 9 م)" : "Full Day (9-9)"}
                    </option>
                    <option value="morning">
                      {lang === "ar" ? "صباحي (9 ص - 3 م)" : "Morning (9-3)"}
                    </option>
                    <option value="evening">
                      {lang === "ar" ? "مسائي (3 م - 9 م)" : "Evening (3-9)"}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-name"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  id="booking-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    lang === "ar" ? "مثال: محمد علي حسن" : "e.g. Mohamed Ali"
                  }
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    {lang === "ar" ? "رقم الموبايل / واتساب" : "Mobile / WhatsApp"}
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E7A]"
                    required
                  />
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 px-5 rounded-xl bg-[#F4B41A] hover:bg-[#DFA00D] disabled:opacity-60 text-slate-900 font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A]"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {submitting
                    ? lang === "ar"
                      ? "جارٍ الحفظ..."
                      : "Confirming..."
                    : lang === "ar"
                      ? `تأكيد وإصدار QR Pass (${computedPrice} ج.م)`
                      : `Confirm & Issue QR Pass (${computedPrice} EGP)`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
