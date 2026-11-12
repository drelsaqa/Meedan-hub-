import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from "../lib/firebase";
import { Lang } from "../data/meedanData";

export const ADMIN_EMAIL = "a01119697113@gmail.com";

export type PreferredZone = "window" | "collab" | "quiet";
export type PreferredTier = "freelancer" | "student" | "startup";
export type TicketCategory = "inquiry" | "complaint" | "support";
export type TicketStatus = "open" | "in_progress" | "resolved";

export interface UserPreferences {
  uid: string;
  displayName: string;
  preferredLang: Lang;
  preferredZone: PreferredZone;
  preferredTier: PreferredTier;
}

export interface UserPrivateInfo {
  uid: string;
  email: string;
  phone?: string;
}

export interface BookingRecord {
  id: string;
  userId: string;
  passId: string;
  spaceId: string;
  spaceLabel: string;
  isDesk: boolean;
  date: string;
  timeSlot: "morning" | "evening" | "fullday";
  tier: PreferredTier;
  totalEgp: number;
  status: "confirmed" | "cancelled";
  createdAt?: Timestamp | null;
}

export interface OccupiedSpaceRecord {
  spaceId: string;
  isDesk: boolean;
  bookedByUid: string;
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  trackId: string;
  trackTitle: string;
  applicantName: string;
  createdAt?: Timestamp | null;
}

export interface MentorBookingRecord {
  id: string;
  userId: string;
  mentorId: string;
  mentorName: string;
  slotLabel: string;
  topic: string;
  createdAt?: Timestamp | null;
}

export interface EventRsvpRecord {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  createdAt?: Timestamp | null;
}

export interface SupportTicketRecord {
  id: string;
  userId: string;
  ticketCode: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  category: TicketCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  adminReply?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  preferences: UserPreferences | null;
  privateInfo: UserPrivateInfo | null;
  bookings: BookingRecord[];
  occupiedSpaces: OccupiedSpaceRecord[];
  enrollments: EnrollmentRecord[];
  mentorBookings: MentorBookingRecord[];
  eventRsvps: EventRsvpRecord[];
  supportTickets: SupportTicketRecord[];
  adminBookings: BookingRecord[];
  adminEnrollments: EnrollmentRecord[];
  adminMentorBookings: MentorBookingRecord[];
  adminEventRsvps: EventRsvpRecord[];
  adminTickets: SupportTicketRecord[];
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  savePreferences: (
    prefs: Pick<
      UserPreferences,
      "displayName" | "preferredLang" | "preferredZone" | "preferredTier"
    >,
    phone?: string
  ) => Promise<void>;
  createBooking: (payload: {
    passId: string;
    spaceId: string;
    spaceLabel: string;
    isDesk: boolean;
    date: string;
    timeSlot: "morning" | "evening" | "fullday";
    tier: PreferredTier;
    totalEgp: number;
    phone?: string;
  }) => Promise<void>;
  cancelBooking: (booking: BookingRecord) => Promise<void>;
  createEnrollment: (payload: {
    trackId: string;
    trackTitle: string;
    applicantName: string;
  }) => Promise<void>;
  createMentorBooking: (payload: {
    mentorId: string;
    mentorName: string;
    slotLabel: string;
    topic: string;
  }) => Promise<void>;
  toggleEventRsvp: (payload: {
    eventId: string;
    eventTitle: string;
  }) => Promise<boolean>;
  createSupportTicket: (payload: {
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    category: TicketCategory;
    subject: string;
    message: string;
  }) => Promise<string>;
  adminUpdateTicket: (
    ticketId: string,
    status: TicketStatus,
    adminReply: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [privateInfo, setPrivateInfo] = useState<UserPrivateInfo | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [occupiedSpaces, setOccupiedSpaces] = useState<OccupiedSpaceRecord[]>(
    []
  );
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [mentorBookings, setMentorBookings] = useState<MentorBookingRecord[]>(
    []
  );
  const [eventRsvps, setEventRsvps] = useState<EventRsvpRecord[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketRecord[]>(
    []
  );

  // Admin collections
  const [adminBookings, setAdminBookings] = useState<BookingRecord[]>([]);
  const [adminEnrollments, setAdminEnrollments] = useState<EnrollmentRecord[]>(
    []
  );
  const [adminMentorBookings, setAdminMentorBookings] = useState<
    MentorBookingRecord[]
  >([]);
  const [adminEventRsvps, setAdminEventRsvps] = useState<EventRsvpRecord[]>(
    []
  );
  const [adminTickets, setAdminTickets] = useState<SupportTicketRecord[]>([]);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  useEffect(() => {
    const path = "occupiedSpaces";
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items: OccupiedSpaceRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (typeof data.spaceId === "string") {
            items.push({
              spaceId: data.spaceId,
              isDesk: Boolean(data.isDesk),
              bookedByUid: String(data.bookedByUid || ""),
            });
          }
        });
        setOccupiedSpaces(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setIsAdmin(false);
        setPreferences(null);
        setPrivateInfo(null);
        setBookings([]);
        setEnrollments([]);
        setMentorBookings([]);
        setEventRsvps([]);
        setSupportTickets([]);
        setAdminBookings([]);
        setAdminEnrollments([]);
        setAdminMentorBookings([]);
        setAdminEventRsvps([]);
        setAdminTickets([]);
        setAuthReady(true);
        return;
      }

      // Check admin eligibility
      let adminVerified =
        firebaseUser.emailVerified && firebaseUser.email === ADMIN_EMAIL;
      if (!adminVerified && firebaseUser.emailVerified) {
        try {
          const adminSnap = await getDoc(doc(db, "admins", firebaseUser.uid));
          adminVerified = adminSnap.exists();
        } catch {
          adminVerified = false;
        }
      }
      setIsAdmin(adminVerified);

      // Bootstrap user preferences & isolated PII document
      const prefRef = doc(db, "users", firebaseUser.uid);
      const privateRef = doc(db, "users", firebaseUser.uid, "private", "info");

      try {
        const prefSnap = await getDoc(prefRef);
        if (!prefSnap.exists()) {
          const defaultDisplayName = (
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Member"
          ).slice(0, 100);
          await setDoc(prefRef, {
            uid: firebaseUser.uid,
            displayName: defaultDisplayName,
            preferredLang: "ar",
            preferredZone: "window",
            preferredTier: "freelancer",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        const privSnap = await getDoc(privateRef);
        if (!privSnap.exists()) {
          await setDoc(privateRef, {
            uid: firebaseUser.uid,
            email: (firebaseUser.email || "member@example.com").slice(0, 160),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Failed to bootstrap member profile:", error);
      }

      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Signed-in user listeners
  useEffect(() => {
    if (!authReady || !user) return;
    const uid = user.uid;

    const unsubPref = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setPreferences({
            uid: d.uid,
            displayName: d.displayName,
            preferredLang: d.preferredLang === "en" ? "en" : "ar",
            preferredZone:
              d.preferredZone === "collab" || d.preferredZone === "quiet"
                ? d.preferredZone
                : "window",
            preferredTier:
              d.preferredTier === "student" || d.preferredTier === "startup"
                ? d.preferredTier
                : "freelancer",
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const unsubPriv = onSnapshot(
      doc(db, "users", uid, "private", "info"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setPrivateInfo({
            uid: d.uid,
            email: d.email,
            phone: typeof d.phone === "string" ? d.phone : "",
          });
        }
      },
      (err) =>
        handleFirestoreError(
          err,
          OperationType.GET,
          `users/${uid}/private/info`
        )
    );

    const unsubBookings = onSnapshot(
      query(collection(db, "bookings"), where("userId", "==", uid)),
      (snap) => {
        const list: BookingRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            passId: data.passId,
            spaceId: data.spaceId,
            spaceLabel: data.spaceLabel,
            isDesk: Boolean(data.isDesk),
            date: data.date,
            timeSlot: data.timeSlot,
            tier: data.tier,
            totalEgp: Number(data.totalEgp || 0),
            status: data.status === "cancelled" ? "cancelled" : "confirmed",
            createdAt: data.createdAt ?? null,
          });
        });
        list.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
        setBookings(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "bookings")
    );

    const unsubEnrollments = onSnapshot(
      query(collection(db, "enrollments"), where("userId", "==", uid)),
      (snap) => {
        const list: EnrollmentRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            trackId: data.trackId,
            trackTitle: data.trackTitle,
            applicantName: data.applicantName,
            createdAt: data.createdAt ?? null,
          });
        });
        setEnrollments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "enrollments")
    );

    const unsubMentors = onSnapshot(
      query(collection(db, "mentorBookings"), where("userId", "==", uid)),
      (snap) => {
        const list: MentorBookingRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            mentorId: data.mentorId,
            mentorName: data.mentorName,
            slotLabel: data.slotLabel,
            topic: data.topic,
            createdAt: data.createdAt ?? null,
          });
        });
        setMentorBookings(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "mentorBookings")
    );

    const unsubRsvps = onSnapshot(
      query(collection(db, "eventRsvps"), where("userId", "==", uid)),
      (snap) => {
        const list: EventRsvpRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            eventId: data.eventId,
            eventTitle: data.eventTitle,
            createdAt: data.createdAt ?? null,
          });
        });
        setEventRsvps(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "eventRsvps")
    );

    const unsubTickets = onSnapshot(
      query(collection(db, "supportTickets"), where("userId", "==", uid)),
      (snap) => {
        const list: SupportTicketRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            ticketCode: data.ticketCode,
            senderName: data.senderName,
            senderEmail: data.senderEmail,
            senderPhone: data.senderPhone,
            category: data.category,
            subject: data.subject,
            message: data.message,
            status: data.status,
            adminReply: data.adminReply,
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          });
        });
        list.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
        setSupportTickets(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "supportTickets")
    );

    return () => {
      unsubPref();
      unsubPriv();
      unsubBookings();
      unsubEnrollments();
      unsubMentors();
      unsubRsvps();
      unsubTickets();
    };
  }, [authReady, user]);

  // Admin-only full collection listeners
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setAdminBookings([]);
      setAdminEnrollments([]);
      setAdminMentorBookings([]);
      setAdminEventRsvps([]);
      setAdminTickets([]);
      return;
    }

    const unsubAllBookings = onSnapshot(
      collection(db, "bookings"),
      (snap) => {
        const list: BookingRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            passId: data.passId,
            spaceId: data.spaceId,
            spaceLabel: data.spaceLabel,
            isDesk: Boolean(data.isDesk),
            date: data.date,
            timeSlot: data.timeSlot,
            tier: data.tier,
            totalEgp: Number(data.totalEgp || 0),
            status: data.status === "cancelled" ? "cancelled" : "confirmed",
            createdAt: data.createdAt ?? null,
          });
        });
        list.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
        setAdminBookings(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "bookings")
    );

    const unsubAllEnrollments = onSnapshot(
      collection(db, "enrollments"),
      (snap) => {
        const list: EnrollmentRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            trackId: data.trackId,
            trackTitle: data.trackTitle,
            applicantName: data.applicantName,
            createdAt: data.createdAt ?? null,
          });
        });
        setAdminEnrollments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "enrollments")
    );

    const unsubAllMentors = onSnapshot(
      collection(db, "mentorBookings"),
      (snap) => {
        const list: MentorBookingRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            mentorId: data.mentorId,
            mentorName: data.mentorName,
            slotLabel: data.slotLabel,
            topic: data.topic,
            createdAt: data.createdAt ?? null,
          });
        });
        setAdminMentorBookings(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "mentorBookings")
    );

    const unsubAllRsvps = onSnapshot(
      collection(db, "eventRsvps"),
      (snap) => {
        const list: EventRsvpRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            eventId: data.eventId,
            eventTitle: data.eventTitle,
            createdAt: data.createdAt ?? null,
          });
        });
        setAdminEventRsvps(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "eventRsvps")
    );

    const unsubAllTickets = onSnapshot(
      collection(db, "supportTickets"),
      (snap) => {
        const list: SupportTicketRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            ticketCode: data.ticketCode,
            senderName: data.senderName,
            senderEmail: data.senderEmail,
            senderPhone: data.senderPhone,
            category: data.category,
            subject: data.subject,
            message: data.message,
            status: data.status,
            adminReply: data.adminReply,
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          });
        });
        list.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
        setAdminTickets(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "supportTickets")
    );

    return () => {
      unsubAllBookings();
      unsubAllEnrollments();
      unsubAllMentors();
      unsubAllRsvps();
      unsubAllTickets();
    };
  }, [authReady, user, isAdmin]);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const savePreferences = useCallback(
    async (
      prefs: Pick<
        UserPreferences,
        "displayName" | "preferredLang" | "preferredZone" | "preferredTier"
      >,
      phone?: string
    ) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      try {
        await updateDoc(doc(db, "users", uid), {
          displayName: prefs.displayName.trim().slice(0, 100),
          preferredLang: prefs.preferredLang,
          preferredZone: prefs.preferredZone,
          preferredTier: prefs.preferredTier,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }

      if (typeof phone === "string") {
        try {
          await updateDoc(doc(db, "users", uid, "private", "info"), {
            phone: phone.trim().slice(0, 32),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.UPDATE,
            `users/${uid}/private/info`
          );
        }
      }
    },
    []
  );

  const createBooking = useCallback(
    async (payload: {
      passId: string;
      spaceId: string;
      spaceLabel: string;
      isDesk: boolean;
      date: string;
      timeSlot: "morning" | "evening" | "fullday";
      tier: PreferredTier;
      totalEgp: number;
      phone?: string;
    }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const bookingId = `${payload.passId}_${Date.now()}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );

      try {
        await setDoc(doc(db, "bookings", bookingId), {
          userId: uid,
          passId: payload.passId.slice(0, 32),
          spaceId: payload.spaceId.slice(0, 32),
          spaceLabel: payload.spaceLabel.slice(0, 140),
          isDesk: payload.isDesk,
          date: payload.date.slice(0, 20),
          timeSlot: payload.timeSlot,
          tier: payload.tier,
          totalEgp: payload.totalEgp,
          status: "confirmed",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `bookings/${bookingId}`
        );
      }

      try {
        await setDoc(doc(db, "occupiedSpaces", payload.spaceId), {
          spaceId: payload.spaceId.slice(0, 32),
          isDesk: payload.isDesk,
          bookedByUid: uid,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `occupiedSpaces/${payload.spaceId}`
        );
      }

      if (payload.phone) {
        try {
          await updateDoc(doc(db, "users", uid, "private", "info"), {
            phone: payload.phone.trim().slice(0, 32),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.UPDATE,
            `users/${uid}/private/info`
          );
        }
      }
    },
    []
  );

  const cancelBooking = useCallback(async (booking: BookingRecord) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `bookings/${booking.id}`
      );
    }

    try {
      await deleteDoc(doc(db, "occupiedSpaces", booking.spaceId));
    } catch (err) {
      console.warn("Occupied space clear skipped:", err);
    }
  }, []);

  const createEnrollment = useCallback(
    async (payload: {
      trackId: string;
      trackTitle: string;
      applicantName: string;
    }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const enrollmentId = `${uid.slice(0, 12)}_${payload.trackId}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );
      try {
        await setDoc(doc(db, "enrollments", enrollmentId), {
          userId: uid,
          trackId: payload.trackId.slice(0, 64),
          trackTitle: payload.trackTitle.slice(0, 160),
          applicantName: payload.applicantName.trim().slice(0, 100),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `enrollments/${enrollmentId}`
        );
      }
    },
    []
  );

  const createMentorBooking = useCallback(
    async (payload: {
      mentorId: string;
      mentorName: string;
      slotLabel: string;
      topic: string;
    }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const docId = `${uid.slice(0, 12)}_${payload.mentorId}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );
      try {
        await setDoc(doc(db, "mentorBookings", docId), {
          userId: uid,
          mentorId: payload.mentorId.slice(0, 64),
          mentorName: payload.mentorName.slice(0, 120),
          slotLabel: payload.slotLabel.slice(0, 80),
          topic: payload.topic.trim().slice(0, 300),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `mentorBookings/${docId}`
        );
      }
    },
    []
  );

  const toggleEventRsvp = useCallback(
    async (payload: { eventId: string; eventTitle: string }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const rsvpId = `${uid.slice(0, 12)}_${payload.eventId}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );
      const exists = eventRsvps.some((r) => r.eventId === payload.eventId);
      if (exists) {
        try {
          await deleteDoc(doc(db, "eventRsvps", rsvpId));
          return false;
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.DELETE,
            `eventRsvps/${rsvpId}`
          );
        }
      } else {
        try {
          await setDoc(doc(db, "eventRsvps", rsvpId), {
            userId: uid,
            eventId: payload.eventId.slice(0, 64),
            eventTitle: payload.eventTitle.slice(0, 160),
            createdAt: serverTimestamp(),
          });
          return true;
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.CREATE,
            `eventRsvps/${rsvpId}`
          );
        }
      }
    },
    [eventRsvps]
  );

  const createSupportTicket = useCallback(
    async (payload: {
      senderName: string;
      senderEmail: string;
      senderPhone?: string;
      category: TicketCategory;
      subject: string;
      message: string;
    }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const ticketCode = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
      const ticketId = `${ticketCode}_${Date.now()}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );
      const docPayload: Record<string, unknown> = {
        userId: uid,
        ticketCode,
        senderName: payload.senderName.trim().slice(0, 100),
        senderEmail: payload.senderEmail.trim().slice(0, 160),
        category: payload.category,
        subject: payload.subject.trim().slice(0, 160),
        message: payload.message.trim().slice(0, 1200),
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (payload.senderPhone && payload.senderPhone.trim()) {
        docPayload.senderPhone = payload.senderPhone.trim().slice(0, 32);
      }

      try {
        await setDoc(doc(db, "supportTickets", ticketId), docPayload);
        return ticketCode;
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `supportTickets/${ticketId}`
        );
      }
    },
    []
  );

  const adminUpdateTicket = useCallback(
    async (ticketId: string, status: TicketStatus, adminReply: string) => {
      if (!auth.currentUser || !isAdmin) throw new Error("Admin access required");
      const updatePayload: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      };
      if (adminReply.trim()) {
        updatePayload.adminReply = adminReply.trim().slice(0, 1200);
      }
      try {
        await updateDoc(doc(db, "supportTickets", ticketId), updatePayload);
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `supportTickets/${ticketId}`
        );
      }
    },
    [isAdmin]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        preferences,
        privateInfo,
        bookings,
        occupiedSpaces,
        enrollments,
        mentorBookings,
        eventRsvps,
        supportTickets,
        adminBookings,
        adminEnrollments,
        adminMentorBookings,
        adminEventRsvps,
        adminTickets,
        signInWithGoogle,
        logout,
        savePreferences,
        createBooking,
        cancelBooking,
        createEnrollment,
        createMentorBooking,
        toggleEventRsvp,
        createSupportTicket,
        adminUpdateTicket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
