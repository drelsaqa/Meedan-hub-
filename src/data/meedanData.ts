export type Lang = "ar" | "en";

export type SpaceCategory = "desk" | "training" | "meeting" | "pod";

export interface SpecialSpace {
  id: string;
  category: Exclude<SpaceCategory, "desk">;
  name: { ar: string; en: string };
  zone: { ar: string; en: string };
  capacity: number;
  priceEgp: number;
  unit: { ar: string; en: string };
  specs: { ar: string; en: string };
  image: string;
  initiallyBooked?: boolean;
}

export interface DeskItem {
  id: string;
  number: number;
  zone: "window" | "collab" | "quiet";
  booked: boolean;
}

export interface AcademyTrack {
  id: string;
  index: string;
  title: { ar: string; en: string };
  partner: { ar: string; en: string };
  duration: { ar: string; en: string };
  format: { ar: string; en: string };
  feeEgp: number;
  seatsLeft: number;
  summary: { ar: string; en: string };
  syllabus: { ar: string[]; en: string[] };
}

export interface Mentor {
  id: string;
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  domain: "engineering" | "design" | "growth" | "freelance";
  domainLabel: { ar: string; en: string };
  experience: { ar: string; en: string };
  nextSlot: { ar: string; en: string };
  topics: { ar: string; en: string };
}

export interface CommunityEvent {
  id: string;
  title: { ar: string; en: string };
  date: { ar: string; en: string };
  time: { ar: string; en: string };
  location: { ar: string; en: string };
  speaker: { ar: string; en: string };
  capacityLeft: number;
  description: { ar: string; en: string };
}

export interface MemberOutcome {
  id: string;
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  metric: { ar: string; en: string };
  quote: { ar: string; en: string };
}

export const IMAGES = {
  hero: "/src/assets/images/meedan_hero_coworking_1794523071416.jpg",
  training: "/src/assets/images/meedan_training_hall_1794523071553.jpg",
  meeting: "/src/assets/images/meedan_meeting_pod_1794523071775.jpg",
  mentor: "/src/assets/images/meedan_mentor_session_1794523072725.jpg",
};

export const INITIAL_DESKS: DeskItem[] = Array.from({ length: 50 }, (_, idx) => {
  const num = idx + 1;
  const zone: DeskItem["zone"] =
    num <= 15 ? "window" : num <= 35 ? "collab" : "quiet";
  // Deterministic realistic baseline occupancy (16 booked, 34 available)
  const bookedIndices = new Set([
    2, 4, 7, 11, 14, 17, 19, 22, 24, 28, 31, 33, 38, 41, 45, 48,
  ]);
  return {
    id: `D${String(num).padStart(2, "0")}`,
    number: num,
    zone,
    booked: bookedIndices.has(num),
  };
});

export const SPECIAL_SPACES: SpecialSpace[] = [
  {
    id: "TH-NILE",
    category: "training",
    name: { ar: "قاعة تدريب النيل", en: "Nile Lab Training Hall" },
    zone: { ar: "الجناح التعليمي · الطابق الرئيسي", en: "Academy Wing · Main Floor" },
    capacity: 20,
    priceEgp: 350,
    unit: { ar: "ج.م / ساعة", en: "EGP / hr" },
    specs: {
      ar: "شاشة تفاعلية 75 بوصة 4K · عزل صوتي كامل · نظام صوتي وميكروفونات",
      en: "75-inch 4K interactive display · Full acoustic isolation · PA & wireless mics",
    },
    image: IMAGES.training,
  },
  {
    id: "TH-TIEC",
    category: "training",
    name: { ar: "استوديو ITIDA التدريبي", en: "ITIDA TIEC Studio" },
    zone: { ar: "الجناح التعليمي · شرق", en: "Academy Wing · East" },
    capacity: 20,
    priceEgp: 350,
    unit: { ar: "ج.م / ساعة", en: "EGP / hr" },
    specs: {
      ar: "20 مقعداً مرناً · سبورة ذكية مزدوجة · بث مباشر عالي السرعة",
      en: "20 modular seats · Dual smartboards · Dedicated livestream uplink",
    },
    image: IMAGES.training,
    initiallyBooked: true,
  },
  {
    id: "MR-ROWAD",
    category: "meeting",
    name: { ar: "غرفة اجتماعات رواد", en: "Rowad Boardroom" },
    zone: { ar: "منطقة الاجتماعات الزجاجية", en: "Glass Collaboration Zone" },
    capacity: 8,
    priceEgp: 150,
    unit: { ar: "ج.م / ساعة", en: "EGP / hr" },
    specs: {
      ar: "شاشة مؤتمرات فيديو · طاولة بلوط طبيعي · لوح زجاجي للعصف الذهني",
      en: "4K video conferencing bar · Natural oak table · Full-wall glass whiteboard",
    },
    image: IMAGES.meeting,
  },
  {
    id: "MR-GLASS",
    category: "meeting",
    name: { ar: "غرفة اجتماعات ميدان", en: "Meedan Glass Pod" },
    zone: { ar: "منطقة الاجتماعات الزجاجية", en: "Glass Collaboration Zone" },
    capacity: 6,
    priceEgp: 120,
    unit: { ar: "ج.م / ساعة", en: "EGP / hr" },
    specs: {
      ar: "عزل صوتي 42dB · منافذ HDMI/USB-C مدمجة · ضيافة قهوة مختصة",
      en: "42dB acoustic glass · Built-in HDMI/USB-C hub · Specialty coffee access",
    },
    image: IMAGES.meeting,
  },
  {
    id: "POD-01",
    category: "pod",
    name: { ar: "كابينة مكالمات 01", en: "Call Booth 01" },
    zone: { ar: "منطقة التركيز الهادئة", en: "Quiet Focus Zone" },
    capacity: 1,
    priceEgp: 40,
    unit: { ar: "ج.م / ساعة", en: "EGP / hr" },
    specs: {
      ar: "مقعد مريح · إضاءة مخصصة لمكالمات الفيديو · تهوية صامتة · منفذ شحن سريع",
      en: "Acoustic isolation · Key light for client calls · Silent ventilation · USB-C PD",
    },
    image: IMAGES.meeting,
  },
  {
    id: "POD-02",
    category: "pod",
    name: { ar: "كابينة مكالمات 02", en: "Call Booth 02" },
    zone: { ar: "منطقة التركيز الهادئة", en: "Quiet Focus Zone" },
    capacity: 1,
    priceEgp: 40,
    unit: { ar: "ج.م / ساعة", en: "EGP / hr" },
    specs: {
      ar: "مقعد مريح · عزل صوتي كامل لمقابلات العمل عن بُعد والعملاء الدوليين",
      en: "Full acoustic privacy for remote interviews & international client syncs",
    },
    image: IMAGES.meeting,
  },
];

export const ACADEMY_TRACKS: AcademyTrack[] = [
  {
    id: "track-fullstack-ai",
    index: "01",
    title: {
      ar: "تطوير الويب المتكامل وتطبيقات الذكاء الاصطناعي",
      en: "Full-Stack & Applied AI Engineering",
    },
    partner: { ar: "اعتماد ITIDA TIEC", en: "ITIDA TIEC Accredited" },
    duration: { ar: "10 أسابيع · هجين", en: "10 Weeks · Hybrid" },
    format: { ar: "مشروعان إنتاجيان", en: "2 Production Capstones" },
    feeEgp: 450,
    seatsLeft: 8,
    summary: {
      ar: "منهج عملي لبناء تطبيقات ويب حديثة بـ TypeScript و React و Node.js مع دمج نماذج الذكاء الاصطناعي وبوابات الدفع.",
      en: "Hands-on curriculum covering TypeScript, React, Node.js APIs, and production AI integration tailored for remote engineering roles.",
    },
    syllabus: {
      ar: [
        "هندسة الواجهات الحديثة بـ React 19 و TypeScript",
        "بناء خوادم Express وقواعد البيانات السحابية",
        "دمج واجهات الذكاء الاصطناعي وتصميم الوكلاء",
        "تجهيز ملف الأعمال على GitHub واجتياز المقابلات التقنية",
      ],
      en: [
        "Modern Frontend Architecture with React 19 & TypeScript",
        "Express APIs, Authentication & Cloud Databases",
        "Production AI SDK Integration & Prompt Engineering",
        "GitHub Portfolio Audit & Global Technical Interviews",
      ],
    },
  },
  {
    id: "track-uiux",
    index: "02",
    title: {
      ar: "تصميم واجهات وتجربة المستخدم وأنظمة التصميم",
      en: "UI/UX & Product Systems Design",
    },
    partner: { ar: "مؤسسة رواد", en: "Rowad Foundation" },
    duration: { ar: "8 أسابيع · حضوري", en: "8 Weeks · In-Person" },
    format: { ar: "استوديو نقد أسبوعي", en: "Weekly Design Critiques" },
    feeEgp: 350,
    seatsLeft: 6,
    summary: {
      ar: "إتقان Figma وأبحاث المستخدمين وبناء Design Systems قابلة للتوسع لمنتجات التكنولوجيا المالية والتجارة الإلكترونية.",
      en: "Master Figma, user research, usability testing, and scalable design systems for fintech and SaaS products.",
    },
    syllabus: {
      ar: [
        "أبحاث المستخدمين ورسم رحلة العميل",
        "بناء أنظمة التصميم والمتغيرات في Figma",
        "تصميم واجهات ثنائية اللغة (عربي RTL / إنجليزي LTR)",
        "إعداد دراسة حالة احترافية لمنصات التوظيف العالمية",
      ],
      en: [
        "User Research, Synthesis & Journey Mapping",
        "Scalable Figma Design Systems & Tokens",
        "Bilingual Arabic RTL & English LTR Interface Craft",
        "Case Study Storytelling for International Product Teams",
      ],
    },
  },
  {
    id: "track-growth",
    index: "03",
    title: {
      ar: "التسويق الرقمي ونمو المنتجات الرقمية",
      en: "Digital Growth & Performance Marketing",
    },
    partner: { ar: "اعتماد ITIDA TIEC", en: "ITIDA TIEC Accredited" },
    duration: { ar: "6 أسابيع · مسائي", en: "6 Weeks · Evening" },
    format: { ar: "حملات حقيقية بميزانية محاكاة", en: "Live Campaign Labs" },
    feeEgp: 300,
    seatsLeft: 11,
    summary: {
      ar: "إدارة حملات الأداء وتحليلات التحويل وكتابة المحتوى الإعلاني للأسواق الخليجية والعالمية.",
      en: "Run performance campaigns, conversion analytics, and acquisition funnels for MENA and international SaaS startups.",
    },
    syllabus: {
      ar: [
        "تحليلات GA4 وقياس عائد الاستثمار الإعلاني ROAS",
        "هيكلة حملات Meta و Google Search المتقدمة",
        "استراتيجيات النمو وتجارب A/B Testing",
        "إعداد تقارير العملاء وإدارة حسابات الوكالات",
      ],
      en: [
        "GA4 Attribution & ROAS Unit Economics",
        "Paid Acquisition on Meta & Google Search",
        "Conversion Rate Optimization & A/B Experimentation",
        "Client Reporting & Agency Retainer Packaging",
      ],
    },
  },
  {
    id: "track-freelance",
    index: "04",
    title: {
      ar: "الجاهزية للعمل الحر والتصدير الرقمي",
      en: "Freelance Export & Client Readiness",
    },
    partner: { ar: "مؤسسة رواد", en: "Rowad Foundation" },
    duration: { ar: "4 أسابيع · مكثف", en: "4 Weeks · Intensive" },
    format: { ar: "مجاني للأعضاء النشطين", en: "Free for Hub Members" },
    feeEgp: 0,
    seatsLeft: 9,
    summary: {
      ar: "تأهيل عملي للتسعير بالدولار، صياغة العروض الاحترافية، إدارة العقود والتحصيل البنكي على منصات العمل الحر العالمية.",
      en: "Practical readiness for pricing in USD, writing winning proposals, international contracts, and cross-border payments.",
    },
    syllabus: {
      ar: [
        "هيكلة الملف الشخصي على Upwork و Toptal و LinkedIn",
        "تسعير المشاريع بالساعة وبالقيمة وتجنب الأخطاء الشائعة",
        "مهارات التفاوض وإدارة نطاق العمل مع العملاء الدوليين",
        "التحصيل المالي القانوني وإصدار الفواتير الضريبية",
      ],
      en: [
        "Positioning Profiles on Upwork, Toptal & LinkedIn",
        "Value-Based USD Pricing & Scope Management",
        "Discovery Calls & International Client Communication",
        "Cross-Border Invoicing & Freelancer Tax Basics",
      ],
    },
  },
];

export const MENTORS: Mentor[] = [
  {
    id: "m-karim",
    name: { ar: "م. كريم الشناوي", en: "Eng. Karim El-Shenawy" },
    role: { ar: "مهندس معماري برمجيات · 12 سنة خبرة", en: "Principal Software Architect · 12y Exp" },
    domain: "engineering",
    domainLabel: { ar: "برمجة ومنتجات", en: "Engineering" },
    experience: { ar: "مراجعة معمارية الكود والتأهيل للشركات العالمية", en: "System architecture & global remote hiring prep" },
    nextSlot: { ar: "الثلاثاء 5:00 م", en: "Tue 5:00 PM" },
    topics: { ar: "مراجعة مشاريع React/Node، الاستعداد لمقابلات Senior، تحجيم قواعد البيانات", en: "Architecture reviews, remote Senior interviews, scaling APIs" },
  },
  {
    id: "m-salma",
    name: { ar: "أ. سلمى عبد الرحمن", en: "Salma Abdelrahman" },
    role: { ar: "قائدة تصميم منتجات · Fintech MENA", en: "Lead Product Designer · Fintech MENA" },
    domain: "design",
    domainLabel: { ar: "تصميم وتجربة مستخدم", en: "Product & UX" },
    experience: { ar: "تصميم أنظمة الدفع وتجربة المستخدم العربية", en: "Fintech UX & bilingual design systems" },
    nextSlot: { ar: "الأربعاء 4:00 م", en: "Wed 4:00 PM" },
    topics: { ar: "نقد ملف الأعمال Portfolio، اختبارات قابلية الاستخدام، أنظمة التصميم", en: "Portfolio critique, usability audits, design token systems" },
  },
  {
    id: "m-tarek",
    name: { ar: "أ. طارق منصور", en: "Tarek Mansour" },
    role: { ar: "مستشار عمل حر · Top Rated Plus", en: "Freelance Export Advisor · Top Rated Plus" },
    domain: "freelance",
    domainLabel: { ar: "عمل حر وتصدير", en: "Freelance Export" },
    experience: { ar: "أكثر من 180 ألف دولار عقود عمل حر دولية", en: "$180k+ verified international freelance contracts" },
    nextSlot: { ar: "الخميس 6:00 م", en: "Thu 6:00 PM" },
    topics: { ar: "كتابة عروض Upwork، تسعير العقود الشهرية Retainers، التفاوض مع العملاء", en: "Winning proposals, monthly retainers, client negotiation" },
  },
  {
    id: "m-nourhan",
    name: { ar: "د. نورهان فؤاد", en: "Dr. Nourhan Fouad" },
    role: { ar: "خبيرة استراتيجيات النمو والتسويق", en: "Growth & Go-To-Market Strategist" },
    domain: "growth",
    domainLabel: { ar: "نمو وتسويق", en: "Growth & GTM" },
    experience: { ar: "إطلاق أكثر من 25 شركة ناشئة في مصر والخليج", en: "Launched 25+ startups across Egypt & GCC" },
    nextSlot: { ar: "السبت 2:00 م", en: "Sat 2:00 PM" },
    topics: { ar: "تحديد الشريحة المستهدفة، تسعير SaaS، خطة الاستحواذ الأولى", en: "ICP positioning, SaaS pricing, first 100 customer playbook" },
  },
  {
    id: "m-youssef",
    name: { ar: "م. يوسف حجازي", en: "Eng. Youssef Hegazy" },
    role: { ar: "خبير تطبيقات الذكاء الاصطناعي", en: "Applied AI Systems Lead" },
    domain: "engineering",
    domainLabel: { ar: "برمجة ومنتجات", en: "Engineering" },
    experience: { ar: "بناء منتجات الذكاء الاصطناعي وأتمتة الأعمال", en: "Production LLM workflows & evaluation pipelines" },
    nextSlot: { ar: "الأحد 5:30 م", en: "Sun 5:30 PM" },
    topics: { ar: "تقييم دقة النماذج، بناء وكلاء البحث، تقليل تكلفة الاستدلال", en: "LLM evaluation, RAG architecture, latency & cost optimization" },
  },
  {
    id: "m-heba",
    name: { ar: "أ. هبة الزيني", en: "Heba El-Zeiny" },
    role: { ar: "مستشارة تأسيس الشركات والتمويل", en: "Startup Legal & Readiness Mentor" },
    domain: "freelance",
    domainLabel: { ar: "عمل حر وتصدير", en: "Startup & Export" },
    experience: { ar: "دعم رواد الأعمال الناشئين وتأهيل عروض المستثمرين", en: "Founder incorporation, IP & seed pitch readiness" },
    nextSlot: { ar: "الاثنين 4:30 م", en: "Mon 4:30 PM" },
    topics: { ar: "تأسيس الشركات الناشئة، اتفاقيات الشركاء، تجهيز Pitch Deck", en: "Company registration, co-founder agreements, seed pitch decks" },
  },
];

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: "ev-demo",
    title: {
      ar: "يوم العرض التجريبي لمشاريع التخرج بالتعاون مع ITIDA TIEC",
      en: "ITIDA TIEC × Rowad Cohort Demo Day",
    },
    date: { ar: "الخميس 19 نوفمبر 2026", en: "Thu, Nov 19, 2026" },
    time: { ar: "6:00 م – 9:00 م", en: "6:00 PM – 9:00 PM" },
    location: { ar: "قاعة تدريب النيل · ميدان هب", en: "Nile Lab Hall · Meedan Hub" },
    speaker: { ar: "لجنة تحكيم من 5 مديري هندسة ومنتجات", en: "Panel of 5 Cairo Engineering & Product Leads" },
    capacityLeft: 18,
    description: {
      ar: "عرض حي لـ 8 منتجات برمجية وتصميمية نفذها متدربو الدفعة الرابعة أمام شركات توظيف ومستثمرين محليين.",
      en: "Live product pitches by 8 graduating teams from Cohort 4 in front of hiring managers and angel mentors.",
    },
  },
  {
    id: "ev-export",
    title: {
      ar: "عيادة التسعير بالدولار: كيف تبني دخلاً مستداماً من العمل الحر؟",
      en: "USD Pricing Clinic: Building Sustainable Remote Retainers",
    },
    date: { ar: "السبت 21 نوفمبر 2026", en: "Sat, Nov 21, 2026" },
    time: { ar: "3:00 م – 5:30 م", en: "3:00 PM – 5:30 PM" },
    location: { ar: "استوديو ITIDA التدريبي", en: "ITIDA TIEC Studio" },
    speaker: { ar: "أ. طارق منصور · مستشار العمل الحر", en: "Tarek Mansour · Freelance Export Advisor" },
    capacityLeft: 12,
    description: {
      ar: "ورشة تفاعلية لمراجعة ملفات الحضور مباشرة وتحويل العقود الفردية إلى عقود شهرية مستقرة.",
      en: "Live profile teardown workshop focused on transitioning from one-off gigs to recurring international retainers.",
    },
  },
  {
    id: "ev-ai-cairo",
    title: {
      ar: "ملتقى مهندسي الذكاء الاصطناعي في القاهرة — نماذج الإنتاج العملية",
      en: "Cairo Applied AI Builders Meetup — Production Workflows",
    },
    date: { ar: "الأربعاء 25 نوفمبر 2026", en: "Wed, Nov 25, 2026" },
    time: { ar: "6:30 م – 8:30 م", en: "6:30 PM – 8:30 PM" },
    location: { ar: "قاعة تدريب النيل · ميدان هب", en: "Nile Lab Hall · Meedan Hub" },
    speaker: { ar: "م. يوسف حجازي و م. كريم الشناوي", en: "Eng. Youssef Hegazy & Eng. Karim El-Shenawy" },
    capacityLeft: 9,
    description: {
      ar: "مناقشة تطبيقية لبناء أنظمة البحث والاستدلال منخفضة التكلفة مع تجربة عملية وتعارف مهني.",
      en: "Technical deep-dive into low-latency AI architectures and structured outputs, followed by open community networking.",
    },
  },
];

export const MEMBER_OUTCOMES: MemberOutcome[] = [
  {
    id: "out-1",
    name: { ar: "أحمد عبد الجواد", en: "Ahmed Abdelgawad" },
    role: { ar: "مطور واجهات أمامية مستقل · القاهرة", en: "Independent Frontend Engineer · Cairo" },
    metric: { ar: "0 انقطاع مكالمات خلال 7 أشهر · زيادة الدخل 2.4x", en: "Zero dropped client calls in 7 months · 2.4x revenue" },
    quote: {
      ar: "كنت أفقد عملاء دوليين بسبب انقطاع الكهرباء وتذبذب الإنترنت في المنزل. وجود فايبر مزدوج مع UPS وكبائن مكالمات هادئة في ميدان هب جعلني ألتزم بعقدين شهريين مع شركات في أوروبا.",
      en: "Home power cuts used to cost me international client renewals. Dual fiber, 3-hour UPS backup, and quiet call booths at Meedan Hub let me keep two recurring European engineering contracts.",
    },
  },
  {
    id: "out-2",
    name: { ar: "مريم حسن", en: "Mariam Hassan" },
    role: { ar: "مصممة منتجات · خريجة مسار UI/UX", en: "Product Designer · UI/UX Track Alumni" },
    metric: { ar: "أول وظيفة عن بُعد خلال 6 أسابيع من التخرج", en: "First remote product role within 6 weeks of graduating" },
    quote: {
      ar: "عيادات الإرشاد الأسبوعية ساعدتني في إعادة بناء ملف أعمالي من الصفر، وخلال يوم العرض التقيت بفريق التوظيف الذي انضممت إليه فوراً.",
      en: "Weekly mentorship clinics helped me rebuild my case studies from scratch, and Demo Day connected me directly with the hiring lead of my current remote team.",
    },
  },
  {
    id: "out-3",
    name: { ar: "عمر نصر وفريق نافذة", en: "Omar Nasr & Nafiza Team" },
    role: { ar: "شركة ناشئة في تكنولوجيا التعليم · 4 أعضاء", en: "EdTech Startup · 4-Person Team" },
    metric: { ar: "توفير 45% من تكلفة المكتب الشهري في وسط البلد", en: "45% lower monthly workspace overhead in Downtown Cairo" },
    quote: {
      ar: "بدلاً من إيجار شقة إدارية وتجهيز الإنترنت والكهرباء الاحتياطية، حصلنا على مكاتب ثابتة وغرف اجتماعات جاهزة للعملاء والمستثمرين بأقل من نصف التكلفة.",
      en: "Instead of signing a rigid office lease and buying backup power, our 4-person team gets dedicated desks and client-ready glass meeting rooms at under half the cost.",
    },
  },
];
