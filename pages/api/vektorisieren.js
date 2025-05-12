// pages/api/vektorisieren.js
import { db } from "@/config/firebase"; // your client‐side Firebase init
import { collection, addDoc } from "firebase/firestore/lite"; // Firestore functions
import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { name, email, phone, message, fileUrl } = req.body;

        // --- Validate input ---
        if (!name || !email || !phone || !fileUrl) {
            return res.status(400).json({ error: "Fehlende Pflichtfelder." });
        }

        // --- 1) Save to Firestore ---
        await addDoc(collection(db, "vektorRequests"), {
            createdAt: new Date().toISOString(),
            name,
            email,
            phone,
            message: message || "",
            file: fileUrl,
        });

        // --- 2) Send notification to owner ---
        const transporter = nodemailer.createTransport({
            host: "smtp.world4you.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
                pass: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YPASSWORD : process.env.NEXT_W4YPASSWORD,
            },
        });

        // Owner mail
        const ownerMail = {
            from: process.env.NEXT_W4YUSER,
            to: process.env.NEXT_DEV === "true" ? "office@atelierbuchner.at" : process.env.NEXT_W4YUSER,
            subject: `Neue Vektorisierungs-Anfrage von ${name}`,
            html: `
        <h2>Neue Vektorisierungs-Anfrage</h2>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>E-Mail:</strong> ${email}</li>
          <li><strong>Telefon:</strong> ${phone}</li>
          <li><strong>Nachricht:</strong> ${message || "(keine)"}</li>
          <li><strong>Datei-Download:</strong> <a href="${fileUrl}">Link öffnen</a></li>
        </ul>
      `,
        };

        // User confirmation mail
        const userMail = {
            from: process.env.NEXT_W4YUSER,
            to: email,
            subject: "Vielen Dank für Ihre Vektorisierungs-Anfrage",
            html: `
        <p>Hallo ${name},</p>
        <p>vielen Dank für Ihre Anfrage. Wir haben Ihre Grafik erhalten und melden uns in Kürze.</p>
        <p>Sie können sie hier herunterladen, falls Sie sie nochmal ansehen möchten:</p>
        <p><a href="${fileUrl}">Grafik herunterladen</a></p>
        <p>Beste Grüße,<br/>Ihr Mainplott-Team</p>
      `,
        };

        // send both mails in parallel
        await Promise.all([transporter.sendMail(ownerMail), transporter.sendMail(userMail)]);

        return res.status(200).json({ message: "Anfrage erfolgreich gespeichert und versendet." });
    } catch (error) {
        console.error("Error in /api/vektorisieren:", error);
        return res.status(500).json({ error: "Interner Serverfehler." });
    }
}
