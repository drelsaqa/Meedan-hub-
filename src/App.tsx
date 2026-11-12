import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { PageHeaderBar, AppPage } from "./components/PageHeaderBar";
import { BookingSection } from "./components/BookingSection";
import { AcademySection } from "./components/AcademySection";
import { MentorshipAndProofSection } from "./components/MentorshipAndProofSection";
import { EventsSection } from "./components/EventsSection";
import { SupportPage } from "./components/SupportPage";
import { AdminDashboardPage } from "./components/AdminDashboardPage";
import { AssistantDrawer } from "./components/AssistantDrawer";
import { AuthModal } from "./components/AuthModal";
import { MemberAccountModal } from "./components/MemberAccountModal";
import { Footer } from "./components/Footer";
import { ToastList, ToastMessage } from "./components/ToastList";
import { AuthProvider, PreferredTier, useAuth } from "./context/AuthContext";
import {
  ACADEMY_TRACKS,
  COMMUNITY_EVENTS,
  INITIAL_DESKS,
  Lang,
  MENTORS,
  SPECIAL_SPACES,
} from "./data/meedanData";

const VALID_PAGES: AppPage[] = [
  "home",
  "booking",
  "academy",
  "mentorship",
  "events",
  "support",
  "admin",
];

function getInitialPage(): AppPage {
  const hash = window.location.hash.replace("#", "") as AppPage;
  return VALID_PAGES.includes(hash) ? hash : "home";
}

function MeedanHubContent() {
  const {
    user,
    isAdmin,
    preferences,
    occupiedSpaces,
    enrollments,
    mentorBookings,
    eventRsvps,
    createBooking,
    createEnrollment,
    createMentorBooking,
    toggleEventRsvp,
  } = useAuth();

  const [lang, setLang] = useState<Lang>("ar");
  const [activePage, setActivePage] = useState<AppPage>(getInitialPage);
  const [guestBookedIds, setGuestBookedIds] = useState<Set<string>>(
    () => new Set()
  );
  const [guestEnrolledIds, setGuestEnrolledIds] = useState<Set<string>>(
    () => new Set()
  );
  const [guestMentorIds, setGuestMentorIds] = useState<Set<string>>(
    () => new Set()
  );
  const [guestRsvpIds, setGuestRsvpIds] = useState<Set<string>>(
    () => new Set()
  );

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync URL hash <-> activePage so browser Back/Forward works seamlessly
  useEffect(() => {
    const onHashChange = () => {
      setActivePage(getInitialPage());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = useCallback((page: AppPage) => {
    setActivePage(page);
    const nextHash = page === "home" ? "" : `#${page}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash || window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (preferences?.preferredLang) {
      setLang(preferences.preferredLang);
    }
  }, [preferences?.preferredLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const addToast = useCallback(
    (text: string, variant: ToastMessage["variant"] = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, text, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const occupiedSet = useMemo(() => {
    const set = new Set<string>(guestBookedIds);
    for (const item of occupiedSpaces) {
      set.add(item.spaceId);
    }
    return set;
  }, [occupiedSpaces, guestBookedIds]);

  const desks = useMemo(
    () =>
      INITIAL_DESKS.map((d) => ({
        ...d,
        booked: d.booked || occupiedSet.has(d.id),
      })),
    [occupiedSet]
  );

  const bookedSpecialIds = useMemo(() => {
    const set = new Set<string>(
      SPECIAL_SPACES.filter((s) => s.initiallyBooked).map((s) => s.id)
    );
    occupiedSet.forEach((id) => set.add(id));
    return set;
  }, [occupiedSet]);

  const enrolledTrackIds = useMemo(() => {
    const set = new Set<string>(guestEnrolledIds);
    enrollments.forEach((e) => set.add(e.trackId));
    return set;
  }, [enrollments, guestEnrolledIds]);

  const tracks = useMemo(
    () =>
      ACADEMY_TRACKS.map((t) => ({
        ...t,
        seatsLeft: enrolledTrackIds.has(t.id)
          ? Math.max(0, t.seatsLeft - 1)
          : t.seatsLeft,
      })),
    [enrolledTrackIds]
  );

  const bookedMentorIds = useMemo(() => {
    const set = new Set<string>(guestMentorIds);
    mentorBookings.forEach((m) => set.add(m.mentorId));
    return set;
  }, [mentorBookings, guestMentorIds]);

  const rsvpEventIds = useMemo(() => {
    const set = new Set<string>(guestRsvpIds);
    eventRsvps.forEach((r) => set.add(r.eventId));
    return set;
  }, [eventRsvps, guestRsvpIds]);

  const availableDesks = desks.filter((d) => !d.booked).length;

  const handleConfirmBooking = async (payload: {
    passId: string;
    spaceId: string;
    spaceLabel: string;
    isDesk: boolean;
    date: string;
    timeSlot: "morning" | "evening" | "fullday";
    tier: PreferredTier;
    totalEgp: number;
    phone: string;
  }) => {
    if (user) {
      await createBooking(payload);
      addToast(
        lang === "ar"
          ? `تم تأكيد الحجز وحفظ التصريح ${payload.passId} في سجل حسابك.`
          : `Booking confirmed & pass ${payload.passId} saved to your account.`,
        "success"
      );
    } else {
      setGuestBookedIds((prev) => {
        const next = new Set(prev);
        next.add(payload.spaceId);
        return next;
      });
      addToast(
        lang === "ar"
          ? `تم تأكيد الحجز وإصدار تصريح ${payload.passId} للمساحة ${payload.spaceId}.`
          : `Booking confirmed! Smart QR Pass ${payload.passId} issued for ${payload.spaceId}.`,
        "success"
      );
    }
  };

  const handleEnrollTrack = async (trackId: string, applicantName: string) => {
    const track = ACADEMY_TRACKS.find((t) => t.id === trackId);
    const trackTitle = track
      ? lang === "ar"
        ? track.title.ar
        : track.title.en
      : trackId;

    if (user) {
      await createEnrollment({ trackId, trackTitle, applicantName });
    } else {
      setGuestEnrolledIds((prev) => {
        const next = new Set(prev);
        next.add(trackId);
        return next;
      });
    }

    addToast(
      lang === "ar"
        ? `تم حجز مقعدك بنجاح يا ${applicantName}!`
        : `Seat reserved for ${applicantName}!`,
      "success"
    );
  };

  const handleBookMentor = async (mentorId: string, topic: string) => {
    const mentor = MENTORS.find((m) => m.id === mentorId);
    const mentorName = mentor
      ? lang === "ar"
        ? mentor.name.ar
        : mentor.name.en
      : mentorId;
    const slotLabel = mentor
      ? lang === "ar"
        ? mentor.nextSlot.ar
        : mentor.nextSlot.en
      : "";

    if (user) {
      await createMentorBooking({ mentorId, mentorName, slotLabel, topic });
    } else {
      setGuestMentorIds((prev) => {
        const next = new Set(prev);
        next.add(mentorId);
        return next;
      });
    }

    addToast(
      lang === "ar"
        ? "تم تأكيد جلسة الإرشاد المجانية (30 دقيقة)."
        : "Your free 30-minute mentorship clinic slot is confirmed!",
      "success"
    );
  };

  const handleToggleRsvp = async (eventId: string) => {
    const event = COMMUNITY_EVENTS.find((ev) => ev.id === eventId);
    const eventTitle = event
      ? lang === "ar"
        ? event.title.ar
        : event.title.en
      : eventId;

    let attending = false;
    if (user) {
      attending = await toggleEventRsvp({ eventId, eventTitle });
    } else {
      const wasAttending = guestRsvpIds.has(eventId);
      attending = !wasAttending;
      setGuestRsvpIds((prev) => {
        const next = new Set(prev);
        if (wasAttending) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        return next;
      });
    }

    addToast(
      attending
        ? lang === "ar"
          ? "تم تأكيد تسجيل حضورك المجاني في الفعالية!"
          : "Free event RSVP confirmed!"
        : lang === "ar"
          ? "تم إلغاء تسجيل حضورك للفعالية."
          : "Your event RSVP has been cancelled.",
      attending ? "success" : "info"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Navbar
        lang={lang}
        activePage={activePage}
        onNavigate={navigateTo}
        onToggleLang={() => setLang((prev) => (prev === "ar" ? "en" : "ar"))}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAccount={() => setAccountModalOpen(true)}
      />

      <main className="flex-1">
        {activePage !== "home" && (
          <PageHeaderBar
            lang={lang}
            activePage={activePage}
            onNavigate={navigateTo}
          />
        )}

        {activePage === "home" && (
          <HomePage
            lang={lang}
            availableDesks={availableDesks}
            isAdmin={isAdmin}
            onNavigate={navigateTo}
            onOpenAssistant={() => setAssistantOpen(true)}
          />
        )}

        {activePage === "booking" && (
          <BookingSection
            lang={lang}
            desks={desks}
            specialSpaces={SPECIAL_SPACES}
            bookedSpecialIds={bookedSpecialIds}
            onConfirmBooking={handleConfirmBooking}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activePage === "academy" && (
          <AcademySection
            lang={lang}
            tracks={tracks}
            enrolledTrackIds={enrolledTrackIds}
            onEnroll={handleEnrollTrack}
          />
        )}

        {activePage === "mentorship" && (
          <MentorshipAndProofSection
            lang={lang}
            bookedMentorIds={bookedMentorIds}
            onBookMentor={handleBookMentor}
          />
        )}

        {activePage === "events" && (
          <EventsSection
            lang={lang}
            events={COMMUNITY_EVENTS}
            rsvpEventIds={rsvpEventIds}
            onToggleRsvp={handleToggleRsvp}
          />
        )}

        {activePage === "support" && (
          <SupportPage
            lang={lang}
            onOpenAuth={() => setAuthModalOpen(true)}
            onNotify={addToast}
          />
        )}

        {activePage === "admin" && (
          <AdminDashboardPage
            lang={lang}
            onOpenAuth={() => setAuthModalOpen(true)}
            onNotify={addToast}
          />
        )}
      </main>

      <Footer
        lang={lang}
        onNavigate={navigateTo}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      <AssistantDrawer
        lang={lang}
        open={assistantOpen}
        onOpen={() => setAssistantOpen(true)}
        onClose={() => setAssistantOpen(false)}
      />

      <AuthModal
        lang={lang}
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(msg) => addToast(msg, "success")}
      />

      <MemberAccountModal
        lang={lang}
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onChangeLang={setLang}
        onNotify={addToast}
      />

      <ToastList toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MeedanHubContent />
    </AuthProvider>
  );
}

export default App;
