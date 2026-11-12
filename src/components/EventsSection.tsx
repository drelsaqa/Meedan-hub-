import { Calendar, Check, MapPin, UserCheck } from "lucide-react";
import { CommunityEvent, Lang } from "../data/meedanData";

interface EventsSectionProps {
  lang: Lang;
  events: CommunityEvent[];
  rsvpEventIds: Set<string>;
  onToggleRsvp: (eventId: string) => void;
}

export function EventsSection({
  lang,
  events,
  rsvpEventIds,
  onToggleRsvp,
}: EventsSectionProps) {
  return (
    <section
      id="events"
      className="py-16 sm:py-20 bg-white border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 max-w-2xl mb-10">
          <div className="text-xs sm:text-sm font-bold text-[#3A9D8F]">
            {lang === "ar"
              ? "فعاليات المجتمع ولقاءات المعرفة"
              : "Community Meetups & Demo Days"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {lang === "ar"
              ? "الفعاليات القادمة في ميدان هب"
              : "Upcoming Events at Meedan Hub"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {lang === "ar"
              ? "لقاءات أسبوعية مفتوحة لرواد الأعمال، مطوري البرمجيات، والمستقلين في قلب القاهرة."
              : "Weekly open workshops, product demo days, and technical meetups in Downtown Cairo."}
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {events.map((event) => {
            const attending = rsvpEventIds.has(event.id);
            const remaining = attending
              ? Math.max(0, event.capacityLeft - 1)
              : event.capacityLeft;

            return (
              <article
                key={event.id}
                className="py-6 sm:py-8 grid lg:grid-cols-12 gap-5 items-center"
              >
                <div className="lg:col-span-3 space-y-1 text-xs sm:text-sm">
                  <div className="font-extrabold text-[#1B5E7A] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{lang === "ar" ? event.date.ar : event.date.en}</span>
                  </div>
                  <div className="text-slate-600 font-medium tabular-nums">
                    {lang === "ar" ? event.time.ar : event.time.en}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {lang === "ar" ? event.location.ar : event.location.en}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {lang === "ar" ? event.title.ar : event.title.en}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang === "ar"
                      ? event.description.ar
                      : event.description.en}
                  </p>
                  <div className="text-xs font-semibold text-slate-500">
                    {lang === "ar" ? event.speaker.ar : event.speaker.en} ·{" "}
                    <span className="tabular-nums text-[#3A9D8F]">
                      {remaining}{" "}
                      {lang === "ar" ? "مقعد متاح" : "spots left"}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-3 flex lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onToggleRsvp(event.id)}
                    className={`h-11 px-5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E7A] ${
                      attending
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-[#1B5E7A] hover:bg-[#134459] text-white"
                    }`}
                  >
                    {attending ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>
                          {lang === "ar" ? "مسجل بالحضور" : "RSVP Confirmed"}
                        </span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {lang === "ar"
                            ? "سجل حضورك مجاناً"
                            : "RSVP Free Seat"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
