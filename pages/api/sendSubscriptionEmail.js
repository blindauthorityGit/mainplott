import nodemailer from "nodemailer";
import { addDoc, collection, serverTimestamp } from "firebase/firestore/lite";
import { db } from "../../config/firebase";
import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // 1) Anmeldung in Firestore speichern
        const collectionName = process.env.NEXT_DEV === "true" ? "dev_anmeldungen" : "anmeldung_kunden";
        await addDoc(collection(db, collectionName), {
            ...req.body,
            createdAt: serverTimestamp(),
        });

        // 2) E-Mail versenden
        const transporter = nodemailer.createTransport({
            host: "smtp.world4you.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
                pass: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YPASSWORD : process.env.NEXT_W4YPASSWORD,
            },
        });

        // 3) Firmenkunden-Mailtexte (ohne Listenpunkte)
        const businessText = `Sehr geehrte/r Kunde,

vielen Dank für Ihre Anmeldung als Firmenkunde auf Mainplott. Ihr Account wurde erfolgreich angelegt. Sie können sich ab sofort unter https://mainplott.de/login mit Ihrer E-Mail ${req.body.email} anmelden.

Für Rückfragen steht Ihnen unser Vertriebsteam gerne zur Verfügung unter Tel. +49 174 / 3177690 oder per E-Mail an info@mainplott.de.

Mit freundlichen Grüßen
Ihr Mainplott-Team`;

        const businessHtml = `
      <p>Sehr geehrte/r Kunde,</p>
      <p>vielen Dank für Ihre Anmeldung als <strong>Firmenkunde</strong> auf <strong>Mainplott</strong>.</p>
      <p>Ihr Account wurde erfolgreich angelegt. Sie können sich ab sofort unter
         <a href="https://mainplott.de/login">mainplott.de/login</a>
         mit Ihrer E-Mail <strong>${req.body.email}</strong> anmelden.</p>
      <p>Für Rückfragen steht Ihnen unser Vertriebsteam gerne zur Verfügung unter
         <a href="tel:+491743177690">+49 174 / 3177690</a> oder per E-Mail an
         <a href="mailto:info@mainplott.de">info@mainplott.de</a>.</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Mainplott-Team</p>
    `;

        const userMailOptions = {
            from: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
            to: req.body.email,
            subject: "Willkommen als Firmenkunde bei Mainplott",
            text: businessText,
            html: businessHtml,
        };

        // 4) Info-Mail an Admin
        const adminMailOptions = {
            from: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
            to: process.env.NEXT_DEV === "true" ? "office@atelierbuchner.at" : process.env.NEXT_W4YUSER,
            subject: `Neuer Firmenkunde: ${req.body.email}`,
            html: `<p>Ein neuer Firmenkunde hat sich registriert: <strong>${req.body.email}</strong></p>`,
        };

        // Mails abschicken
        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);

        return res.status(200).json({ message: "Anmeldung erfolgreich gespeichert und bestätigt" });
    } catch (error) {
        console.error("Error in /api/register:", error);
        return res.status(500).json({ error: "Fehler bei der Verarbeitung Ihrer Anfrage" });
    }
}
