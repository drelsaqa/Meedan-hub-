import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lang } from "../data/meedanData";
import { BookingRecord, EventRsvpRecord } from "../context/AuthContext";

interface ActivitySummaryProps {
  lang: Lang;
  bookings: BookingRecord[];
  eventRsvps: EventRsvpRecord[];
}

interface WeeklyPoint {
  weekLabel: string;
  dateRange: string;
  bookingHours: number;
  eventsJoined: number;
}

function getSlotHours(slot: BookingRecord["timeSlot"]): number {
  return slot === "fullday" ? 12 : 6;
}

function startOfDayMs(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function ActivitySummary({
  lang,
  bookings,
  eventRsvps,
}: ActivitySummaryProps) {
  const { weeklyData, totalHours, confirmedCount, eventsCount } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDayMs(now);
    const dayMs = 24 * 60 * 60 * 1000;
    const windowStart = todayStart - 27 * dayMs; // 4 weeks = 28 days ending today

    const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });

    const buckets: WeeklyPoint[] = Array.from({ length: 4 }, (_, idx) => {
      const bStart = windowStart + idx * 7 * dayMs;
      const bEnd = bStart + 6 * dayMs;
      return {
        weekLabel:
          lang === "ar" ? `أسبوع ${idx + 1}` : `Week ${idx + 1}`,
        dateRange: `${fmt.format(new Date(bStart))} – ${fmt.format(new Date(bEnd))}`,
        bookingHours: 0,
        eventsJoined: 0,
      };
    });

    let hoursSum = 0;
    let confirmedSum = 0;
    let eventsSum = 0;

    for (const b of bookings) {
      if (b.status !== "confirmed") continue;

      let targetMs: number | null = null;
      if (b.date) {
        const parsed = new Date(`${b.date}T00:00:00`);
        if (!Number.isNaN(parsed.getTime())) {
          targetMs = parsed.getTime();
        }
      }

      // If booked for an upcoming date, attribute to creation date within the month window
      if (
        (targetMs === null || targetMs > todayStart) &&
        b.createdAt?.toDate
      ) {
        targetMs = startOfDayMs(b.createdAt.toDate());
      } else if (targetMs === null) {
        targetMs = todayStart;
      }

      if (targetMs >= windowStart && targetMs <= todayStart + dayMs) {
        const clampedMs = Math.min(targetMs, todayStart);
        const bucketIdx = Math.min(
          3,
          Math.max(0, Math.floor((clampedMs - windowStart) / (7 * dayMs)))
        );
        const hrs = getSlotHours(b.timeSlot);
        buckets[bucketIdx].bookingHours += hrs;
        hoursSum += hrs;
        confirmedSum += 1;
      }
    }

    for (const rsvp of eventRsvps) {
      const rsvpDate = rsvp.createdAt?.toDate
        ? startOfDayMs(rsvp.createdAt.toDate())
        : todayStart;
      if (rsvpDate >= windowStart && rsvpDate <= todayStart + dayMs) {
        const clampedMs = Math.min(rsvpDate, todayStart);
        const bucketIdx = Math.min(
          3,
          Math.max(0, Math.floor((clampedMs - windowStart) / (7 * dayMs)))
        );
        buckets[bucketIdx].eventsJoined += 1;
        eventsSum += 1;
      }
    }

    return {
      weeklyData: buckets,
      totalHours: hoursSum,
      confirmedCount: confirmedSum,
      eventsCount: eventsSum,
    };
  }, [bookings, eventRsvps, lang]);

  const hoursLabel = lang === "ar" ? "ساعات الحجز" : "Booking Hours";
  const eventsLabel = lang === "ar" ? "مشاركة الفعاليات" : "Events Joined";

  return (
    <section
      aria-label={
        lang === "ar"
          ? "ملخص النشاط خلال آخر شهر"
          : "Activity summary over the last month"
      }
      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">
            {lang === "ar"
              ? "ملخص النشاط · آخر 30 يوماً"
              : "Activity Summary · Last Month"}
          </h4>
          <p className="text-xs text-slate-500">
            {lang === "ar"
              ? "توزيع ساعات حجز المساحات وحضور الفعاليات أسبوعياً"
              : "Weekly breakdown of reserved workspace hours and event RSVPs"}
          </p>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-3 gap-3 border-y border-slate-200 py-3">
        <div>
          <div className="text-lg sm:text-xl font-black text-[#1B5E7A] tabular-nums">
            {totalHours} {lang === "ar" ? "س" : "h"}
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-600">
            {hoursLabel}
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
            {confirmedCount}
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-600">
            {lang === "ar" ? "حجوزات مؤكدة" : "Confirmed Bookings"}
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-black text-[#3A9D8F] tabular-nums">
            {eventsCount}
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-600">
            {eventsLabel}
          </div>
        </div>
      </div>

      {/* Recharts BarChart (LTR wrapper ensures SVG axis coordinates stay reliable in RTL layouts) */}
      <div dir="ltr" className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="hours"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#1B5E7A" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="events"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#3A9D8F" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0].payload as WeeklyPoint;
                return (
                  <div
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-md text-xs space-y-1"
                  >
                    <div className="font-extrabold text-slate-900">
                      {point.weekLabel} · {point.dateRange}
                    </div>
                    <div className="text-[#1B5E7A] font-bold tabular-nums">
                      {hoursLabel}: {point.bookingHours}{" "}
                      {lang === "ar" ? "ساعة" : "hrs"}
                    </div>
                    <div className="text-[#3A9D8F] font-bold tabular-nums">
                      {eventsLabel}: {point.eventsJoined}
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "6px" }}
            />
            <Bar
              yAxisId="hours"
              dataKey="bookingHours"
              name={hoursLabel}
              fill="#1B5E7A"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              yAxisId="events"
              dataKey="eventsJoined"
              name={eventsLabel}
              fill="#3A9D8F"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {totalHours === 0 && eventsCount === 0 && (
        <p className="text-xs text-slate-500 text-center">
          {lang === "ar"
            ? "ابدأ بحجز مكتب أو التسجيل في فعالية ليظهر نشاطك الشهري هنا."
            : "Book a workspace or RSVP to an event to populate your monthly chart."}
        </p>
      )}
    </section>
  );
}
