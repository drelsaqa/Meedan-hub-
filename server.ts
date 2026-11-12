import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const MEEDAN_SYSTEM_INSTRUCTION = `You are the AI Professional Assistant (المساعد المهني الذكي) for Meedan Hub (ميدان هب), a 400m² coworking and community learning center in Downtown Cairo launched by Rowad Foundation for Innovation & Impact in collaboration with ITIDA TIEC.

Answer user questions accurately in real time using these verified Meedan Hub service details:

1. Space Booking & Infrastructure:
   - Open daily: 9:00 AM – 11:00 PM. Downtown Innovation Corridor, Cairo.
   - Reliability: Dual Fiber Internet 200+ Mbps with auto-failover + Central UPS backup power (3 hours uninterrupted runtime).
   - 50 Ergonomic Hot Desks across 3 zones:
     * Window Daylight Zone (D01–D15)
     * Central Collaborative Zone (D16–D35)
     * Quiet Deep-Work Zone (D36–D50)
     Pricing: 50 EGP/full day or 35 EGP/half day (30% student/recent-grad subsidy makes full day 35 EGP).
   - 2 Soundproof Training Halls ("Nile Lab" & "TIEC Studio", 20 seats each, 75" 4K interactive display, PA audio): 350 EGP/hour.
   - 2 Glass Acoustic Meeting Rooms ("Rowad Boardroom" 8 seats at 150 EGP/hr; "Meedan Glass Pod" 6 seats at 120 EGP/hr).
   - 2 Private Acoustic Call Booths ("Call Booth 01" & "Call Booth 02", 1 person): 40 EGP/hour.
   - Instant scannable QR Entry Pass issued on booking, saved in user's Booking History when signed in.

2. Accredited Academy Tracks (4 Tracks, ITIDA TIEC & Rowad Foundation):
   - 01. Full-Stack & Applied AI Engineering (10 weeks · Hybrid · 450 EGP subsidized).
   - 02. UI/UX & Product Systems Design (8 weeks · In-person · 350 EGP subsidized).
   - 03. Digital Growth & Performance Marketing (6 weeks · Evening · 300 EGP subsidized).
   - 04. Freelance Export & Client Readiness (4 weeks · Intensive · Free for Hub Members).

3. Free Mentorship Clinics (6 Industry Mentors · 40 hours/month free):
   - Eng. Karim El-Shenawy (Engineering/Architecture, Tue 5 PM)
   - Salma Abdelrahman (Product & UX, Wed 4 PM)
   - Tarek Mansour (Freelance Dollar Export & Upwork, Thu 6 PM)
   - Dr. Nourhan Fouad (Growth & GTM, Sat 2 PM)
   - Eng. Youssef Hegazy (Applied AI Systems, Sun 5:30 PM)
   - Heba El-Zeiny (Startup Legal & Seed Readiness, Mon 4:30 PM)

4. Upcoming Community Events:
   - ITIDA TIEC × Rowad Cohort Demo Day (Thu Nov 19, 6–9 PM, Nile Lab Hall).
   - USD Pricing Clinic: Building Sustainable Remote Retainers (Sat Nov 21, 3–5:30 PM, ITIDA TIEC Studio).
   - Cairo Applied AI Builders Meetup (Wed Nov 25, 6:30–8:30 PM, Nile Lab Hall).

5. Member Accounts & Personalization:
   - Users can Sign Up / Log In via Google to save their Booking History, QR Passes, Preferred Desk Zone, Preferred Language, and Member Category, plus view Academy Enrollments, Mentorship Bookings, and Event RSVPs.

Guidelines:
- Always respond in the language of the user's message (Arabic or English).
- Be concise, structured, practical, and accurate. Never invent prices or rooms not listed above.`;

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "meedan-hub" });
  });

  app.post("/api/assistant", async (req, res) => {
    try {
      const { message, history = [], lang = "ar", stream = false } = req.body as {
        message?: string;
        history?: ChatHistoryMessage[];
        lang?: "ar" | "en";
        stream?: boolean;
      };

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          error:
            lang === "ar"
              ? "يرجى كتابة سؤالك أولاً."
              : "Please enter a question first.",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error:
            lang === "ar"
              ? "خدمة المساعد الذكي غير مفعلة حالياً لعدم توفر مفتاح التشغيل على الخادم."
              : "Assistant service is currently unavailable on the server.",
        });
      }

      const trimmedHistory = Array.isArray(history)
        ? history.slice(-10).map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: String(item.content || "") }],
          }))
        : [];

      const contents = [
        ...trimmedHistory,
        {
          role: "user",
          parts: [{ text: message.trim() }],
        },
      ];

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const responseStream = await ai.models.generateContentStream({
          model: "gemini-4-hydrogen",
          contents,
          config: {
            systemInstruction: MEEDAN_SYSTEM_INSTRUCTION,
          },
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      }

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents,
        config: {
          systemInstruction: MEEDAN_SYSTEM_INSTRUCTION,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({
          error:
            lang === "ar"
              ? "لم يتم استلام رد مناسب، يرجى المحاولة مرة أخرى."
              : "No response was generated. Please try again.",
        });
      }

      return res.json({ reply });
    } catch (error) {
      console.error("Gemini assistant error:", error);
      if (!res.headersSent) {
        return res.status(500).json({
          error:
            "حدث خطأ أثناء الاتصال بالمساعد المهني الذكي. يرجى المحاولة بعد قليل.",
        });
      }
      res.write(
        `data: ${JSON.stringify({
          error: "Connection interrupted while streaming response.",
        })}\n\n`
      );
      return res.end();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Meedan Hub server running on http://localhost:${PORT}`);
  });
}

startServer();
