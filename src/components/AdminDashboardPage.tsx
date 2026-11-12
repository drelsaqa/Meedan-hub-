import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  Check,
  GraduationCap,
  LayoutDashboard,
  Lock,
  MessageSquareWarning,
  Search,
  Trash2,
} from "lucide-react";
import { Lang } from "../data/meedanData";
import {
  ADMIN_EMAIL,
  BookingRecord,
  SupportTicketRecord,
  TicketStatus,
  useAuth,
} from "../context/AuthContext";

interface AdminDashboardPageProps {
  lang: Lang;
  onOpenAuth: () => void;
  onNotify: (text: string, variant?: "success" | "info") => void;
}

type AdminSection = "overview" | "tickets" | "bookings" | "community";

export function AdminDashboardPage({
  lang,
  onOpenAuth,
  onNotify,
}: AdminDashboardPageProps) {
  const {
    user,
    isAdmin,
    occupiedSpaces,
    adminBookings,
    adminEnrollments,
    adminMentorBookings,
    adminEventRsvps,
    adminTickets,
    adminUpdateTicket,
    cancelBooking,
  } = useAuth();

  const [section, setSection] = useState<AdminSection>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [ticketFilter, setTicketFilter] = useState<"all" | TicketStatus>("all");
  const [bookingFilter, setBookingFilter] = useState<
    "all" | "confirmed" | "cancelled"
  >("all");

  const [editingTicket, setEditingTicket] =
    useState<SupportTicketRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [nextStatus, setNextStatus] = useState<TicketStatus>("in_progress");
  const [savingTicket, setSavingTicket] = useState(false);

  const metrics = useMemo(() => {
    const confirmedBookings = adminBookings.filter(
      (b) => b.status === "confirmed"
    );
    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + b.totalEgp,
      0
    );
    const openTickets = adminTickets.filter((t) => t.status !== "resolved")
      .length;

    const chartData = [
      {
        name: lang === "ar" ? "الحجوزات المؤكدة" : "Confirmed Bookings",
        count: confirmedBookings.length,
      },
      {
        name: lang === "ar" ? "الأكاديمية" : "Academy",
        count: adminEnrollments.length,
      },
      {
        name: lang === "ar" ? "الإرشاد" : "Mentorship",
        count: adminMentorBookings.length,
      },
      {
        name: lang === "ar" ? "الفعاليات" : "Events",
        count: adminEventRsvps.length,
      },
      {
        name: lang === "ar" ? "تذاكر الدعم" : "Tickets",
        count: adminTickets.length,
      },
    ];

    return {
      confirmedCount: confirmedBookings.length,
      totalRevenue,
      openTickets,
      occupiedCount: occupiedSpaces.length,
      chartData,
    };
  }, [
    adminBookings,
    adminEnrollments,
    adminMentorBookings,
    adminEventRsvps,
    adminTickets,
    occupiedSpaces,
    lang,
  ]);

  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return adminTickets.filter((t) => {
      if (ticketFilter !== "all" && t.status !== ticketFilter) return false;
      if (!q) return true;
      return (
        t.ticketCode.toLowerCase().includes(q) ||
        t.senderName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.senderEmail.toLowerCase().includes(q)
      );
    });
  }, [adminTickets, ticketFilter, searchTerm]);

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return adminBookings.filter((b) => {
      if (bookingFilter !== "all" && b.status !== bookingFilter) return false;
      if (!q) return true;
      return (
        b.passId.toLowerCase().includes(q) ||
        b.spaceId.toLowerCase().includes(q) ||
        b.spaceLabel.toLowerCase().includes(q) ||
        b.date.includes(q)
      );
    });
  }, [adminBookings, bookingFilter, searchTerm]);

  if (!user || !isAdmin) {
    return (
      <section className="py-16 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#1B5E7A]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {lang === "ar"
            ? "لوحة تحكم مدير الموقع"
            : "Site Administrator Dashboard"}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {lang === "ar"
            ? `هذه اللوحة محمية بصلاحيات الإدارة لإدارة الحجوزات والشكاوى وخدمة العملاء. يرجى تسجيل الدخول بحساب المدير المصرح له (${ADMIN_EMAIL}).`
            : `This workspace is restricted to authorized site administrators (${ADMIN_EMAIL}). Please sign in with the administrator account to manage bookings and support tickets.`}
        </p>
        {!user && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="h-11 px-6 rounded-xl bg-[#1B5E7A] hover:bg-[#134459] text-white font-bold text-sm inline-flex items-center gap-2"
          >
            <span>{lang === "ar" ? "تسجيل دخول المدير" : "Admin Sign In"}</span>
          </button>
        )}
      </section>
    );
  }

  const handleSaveTicketUpdate = async () => {
    if (!editingTicket) return;
    setSavingTicket(true);
    try {
      await adminUpdateTicket(editingTicket.id, nextStatus, replyText);
      onNotify(
        lang === "ar"
          ? `تم تحديث حالة التذكرة ${editingTicket.ticketCode}.`
          : `Ticket ${editingTicket.ticketCode} updated.`,
        "success"
      );
      setEditingTicket(null);
      setReplyText("");
    } catch {
      onNotify(
        lang === "ar"
          ? "تعذر تحديث التذكرة."
          : "Could not update support ticket.",
        "info"
      );
    } finally {
      setSavingTicket(false);
    }
  };

  const handleAdminCancelBooking = async (booking: BookingRecord) => {
    try {
      await cancelBooking(booking);
      onNotify(
        lang === "ar"
          ? `تم إلغاء الحجز ${booking.passId} وتحرير المساحة ${booking.spaceId}.`
          : `Cancelled ${booking.passId} and released ${booking.spaceId}.`,
        "info"
      );
    } catch {
      onNotify(
        lang === "ar" ? "تعذر إلغاء الحجز." : "Failed to cancel booking.",
        "info"
      );
    }
  };

  const navItems: {
    id: AdminSection;
    icon: typeof LayoutDashboard;
    ar: string;
    en: string;
  }[] = [
    { id: "overview", icon: LayoutDashboard, ar: "نظرة عامة", en: "Overview" },
    {
      id: "tickets",
      icon: MessageSquareWarning,
      ar: `الشكاوى والدعم (${adminTickets.length})`,
      en: `Tickets (${adminTickets.length})`,
    },
    {
      id: "bookings",
      icon: CalendarCheck,
      ar: `إدارة الحجوزات (${adminBookings.length})`,
      en: `Bookings (${adminBookings.length})`,
    },
    {
      id: "community",
      icon: GraduationCap,
      ar: "الأكاديمية والإرشاد",
      en: "Academy & Community",
    },
  ];

  return (
    <section className="py-10 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation (SaaS Dashboard Architecture) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="px-2 pb-3 border-b border-slate-100">
            <div className="text-xs font-bold text-[#3A9D8F]">
              {lang === "ar" ? "الإدارة التشغيلية" : "Hub Operations"}
            </div>
            <h1 className="font-black text-lg text-slate-900 mt-0.5">
              {lang === "ar" ? "لوحة تحكم المدير" : "Admin Console"}
            </h1>
            <div className="text-xs text-slate-500 truncate mt-0.5" dir="ltr">
              {user.email}
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`w-full h-10 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors ${
                    active
                      ? "bg-[#1B5E7A] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {lang === "ar" ? item.ar : item.en}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Admin Workspace */}
        <div className="lg:col-span-9 space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500">
                {lang === "ar" ? "إيراد الحجوزات المؤكدة" : "Confirmed Revenue"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1B5E7A] tabular-nums">
                {metrics.totalRevenue} {lang === "ar" ? "ج.م" : "EGP"}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500">
                {lang === "ar" ? "الحجوزات المؤكدة" : "Confirmed Bookings"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                {metrics.confirmedCount}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500">
                {lang === "ar" ? "تذاكر مفتوحة / قيد الحل" : "Open Support Tickets"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 tabular-nums">
                {metrics.openTickets}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500">
                {lang === "ar" ? "متدربون وإرشاد وفعاليات" : "Learning & Events"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#3A9D8F] tabular-nums">
                {adminEnrollments.length +
                  adminMentorBookings.length +
                  adminEventRsvps.length}
              </div>
            </div>
          </div>

          {section === "overview" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">
                  {lang === "ar"
                    ? "ملخص العمليات عبر خدمات المركز"
                    : "Operations Breakdown Across Hub Services"}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === "ar"
                    ? "بيانات حية محدثة مباشرة من قاعدة البيانات"
                    : "Live counts synchronized from Firestore collections"}
                </p>
              </div>

              <div dir="ltr" className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E2E8F0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#1B5E7A"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {section === "tickets" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "بحث برقم التذكرة أو الاسم أو الموضوع..."
                        : "Search by ticket code, sender or subject..."
                    }
                    className="w-full h-10 ps-9 pe-3 rounded-lg border border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {(
                    [
                      { id: "all", ar: "الكل", en: "All" },
                      { id: "open", ar: "مفتوحة", en: "Open" },
                      { id: "in_progress", ar: "قيد المراجعة", en: "In Progress" },
                      { id: "resolved", ar: "تم الحل", en: "Resolved" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTicketFilter(f.id)}
                      className={`h-8 px-3 rounded-md text-xs font-bold transition-colors ${
                        ticketFilter === f.id
                          ? "bg-white text-[#1B5E7A] shadow-xs"
                          : "text-slate-600"
                      }`}
                    >
                      {lang === "ar" ? f.ar : f.en}
                    </button>
                  ))}
                </div>
              </div>

              {editingTicket && (
                <div className="rounded-xl border border-[#1B5E7A] bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-sm text-slate-900">
                      {editingTicket.ticketCode} · {editingTicket.subject}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTicket(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === "ar" ? "حالة التذكرة" : "Status"}
                      </label>
                      <select
                        value={nextStatus}
                        onChange={(e) =>
                          setNextStatus(e.target.value as TicketStatus)
                        }
                        className="w-full h-10 px-2.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                      >
                        <option value="open">
                          {lang === "ar" ? "مفتوحة" : "Open"}
                        </option>
                        <option value="in_progress">
                          {lang === "ar" ? "قيد المراجعة" : "In Progress"}
                        </option>
                        <option value="resolved">
                          {lang === "ar" ? "تم الحل" : "Resolved"}
                        </option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === "ar" ? "رد الإدارة للعميل" : "Admin Reply"}
                      </label>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "اكتب رد خدمة العملاء هنا..."
                            : "Write response to the member..."
                        }
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={savingTicket}
                      onClick={handleSaveTicketUpdate}
                      className="h-9 px-4 rounded-lg bg-[#1B5E7A] text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {savingTicket
                          ? lang === "ar"
                            ? "جارٍ الحفظ..."
                            : "Saving..."
                          : lang === "ar"
                            ? "حفظ التحديث والرد"
                            : "Save Status & Reply"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {filteredTickets.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  {lang === "ar"
                    ? "لا توجد شكاوى أو تذاكر مطابقة."
                    : "No matching support tickets found."}
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                          <span className="font-mono text-[#1B5E7A]">
                            {t.ticketCode}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-700">{t.senderName}</span>
                          <span className="text-slate-400">·</span>
                          <span
                            className={
                              t.status === "resolved"
                                ? "text-emerald-700"
                                : t.status === "in_progress"
                                  ? "text-amber-700"
                                  : "text-red-700"
                            }
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {t.subject}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2">
                          {t.message}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTicket(t);
                          setNextStatus(t.status);
                          setReplyText(t.adminReply || "");
                        }}
                        className="h-9 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#1B5E7A] shrink-0"
                      >
                        {lang === "ar" ? "رد وتحديث" : "Reply / Update"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === "bookings" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "بحث برقم التصريح أو المقعد أو التاريخ..."
                        : "Search pass ID, space or date..."
                    }
                    className="w-full h-10 ps-9 pe-3 rounded-lg border border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {(["all", "confirmed", "cancelled"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setBookingFilter(st)}
                      className={`h-8 px-3 rounded-md text-xs font-bold ${
                        bookingFilter === st
                          ? "bg-white text-[#1B5E7A] shadow-xs"
                          : "text-slate-600"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-start">
                  <thead className="border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 pe-3 text-start">Pass ID</th>
                      <th className="py-2.5 pe-3 text-start">
                        {lang === "ar" ? "المساحة" : "Space"}
                      </th>
                      <th className="py-2.5 pe-3 text-start">
                        {lang === "ar" ? "التاريخ" : "Date"}
                      </th>
                      <th className="py-2.5 pe-3 text-end">EGP</th>
                      <th className="py-2.5 pe-3 text-start">
                        {lang === "ar" ? "الحالة" : "Status"}
                      </th>
                      <th className="py-2.5 text-end">
                        {lang === "ar" ? "إجراء" : "Action"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60">
                        <td className="py-3 pe-3 font-mono font-bold text-[#1B5E7A] tabular-nums">
                          {b.passId}
                        </td>
                        <td className="py-3 pe-3 font-semibold text-slate-900">
                          {b.spaceLabel}
                        </td>
                        <td className="py-3 pe-3 tabular-nums text-slate-600">
                          {b.date}
                        </td>
                        <td className="py-3 pe-3 text-end font-mono tabular-nums font-bold">
                          {b.totalEgp}
                        </td>
                        <td className="py-3 pe-3 font-bold">
                          <span
                            className={
                              b.status === "confirmed"
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 text-end">
                          {b.status === "confirmed" && (
                            <button
                              type="button"
                              onClick={() => handleAdminCancelBooking(b)}
                              className="h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{lang === "ar" ? "إلغاء" : "Cancel"}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-slate-500"
                        >
                          {lang === "ar"
                            ? "لا توجد حجوزات مسجلة بعد."
                            : "No bookings recorded yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "community" && (
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {lang === "ar"
                    ? `طلبات الأكاديمية (${adminEnrollments.length})`
                    : `Academy Applicants (${adminEnrollments.length})`}
                </h3>
                <ul className="space-y-2 text-xs">
                  {adminEnrollments.map((e) => (
                    <li
                      key={e.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="font-bold text-slate-900">
                        {e.applicantName}
                      </div>
                      <div className="text-slate-600">{e.trackTitle}</div>
                    </li>
                  ))}
                  {adminEnrollments.length === 0 && (
                    <li className="text-slate-500">
                      {lang === "ar" ? "لا توجد طلبات." : "No enrollments yet."}
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {lang === "ar"
                    ? `جلسات الإرشاد (${adminMentorBookings.length})`
                    : `Mentorship Slots (${adminMentorBookings.length})`}
                </h3>
                <ul className="space-y-2 text-xs">
                  {adminMentorBookings.map((m) => (
                    <li
                      key={m.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="font-bold text-slate-900">
                        {m.mentorName}
                      </div>
                      <div className="text-[#3A9D8F] font-semibold">
                        {m.slotLabel}
                      </div>
                      <div className="text-slate-600 mt-0.5">{m.topic}</div>
                    </li>
                  ))}
                  {adminMentorBookings.length === 0 && (
                    <li className="text-slate-500">
                      {lang === "ar" ? "لا توجد حجوزات." : "No mentorship bookings."}
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {lang === "ar"
                    ? `حضور الفعاليات (${adminEventRsvps.length})`
                    : `Event RSVPs (${adminEventRsvps.length})`}
                </h3>
                <ul className="space-y-2 text-xs">
                  {adminEventRsvps.map((r) => (
                    <li
                      key={r.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800"
                    >
                      {r.eventTitle}
                    </li>
                  ))}
                  {adminEventRsvps.length === 0 && (
                    <li className="text-slate-500">
                      {lang === "ar" ? "لا توجد تسجيلات." : "No RSVPs yet."}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
