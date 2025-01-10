import nodemailer from "nodemailer";
import { addDoc, collection, serverTimestamp } from "firebase/firestore/lite";
import { db } from "../../config/firebase"; // Adjust this import according to your firebase config file path
import axios from "axios";

export default async function handler(req, res) {
    // Correct way to access the environment variable

    if (req.method === "POST") {
        try {
            // Save to Firestore: dev = true -> "dev_anmeldungen", dev = false -> "anmeldung_kurse"
            const collectionName = process.env.NEXT_DEV === "true" ? "dev_anmeldungen" : "anmeldung_kurse";

            // Save to Firestore only if NEXT_DEV is not true
            // if (process.env.NEXT_DEV === "true") {
            //     // Save to the "dev_anmeldungen" collection in development mode
            //     await addDoc(collection(db, "dev_anmeldungen"), {
            //         ...req.body, // Spread the body data
            //         createdAt: serverTimestamp(), // Add the server timestamp for the creation time
            //     });
            // } else {
            //     // Save to the "anmeldung_kurse" collection in production mode
            //     await addDoc(collection(db, "anmeldung_kurse"), {
            //         ...req.body, // Spread the body data
            //         createdAt: serverTimestamp(), // Add the server timestamp for the creation time
            //     });
            // }

            // Set up Nodemailer
            const transporter = nodemailer.createTransport({
                host: process.env.NEXT_DEV === "true" ? "smtp.world4you.com" : "smtp.world4you.com",
                port: 587,
                secure: false,
                auth: {
                    user:
                        process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_MAIL_BUCHUNG_LIVE,
                    pass:
                        process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YPASSWORD : process.env.NEXT_MAIL_PW_LIVE,
                },
            });

            // Define email templates
            const pekipText = `Liebe/t ${req.body.name},
vielen Dank für Dein Interesse an einem PEKiP Kurs.

Ist Dein Baby noch nicht auf der Welt:

Durch diese Anfrage wirst Du automatisch auf der Interessentenliste eingetragen. In der Regel beginnt die Planung für die Kurse ca. 3-4 Wochen vor Beginn.

Wir machen die Altersspanne der neuen Kurse immer auch von der Nachfrage abhängig. Daher können wir jetzt noch nicht sagen, an welchem Tag und zu welcher Uhrzeit, der für Dich passende Kurs stattfinden wird.

Ist Dein Baby schon auf der Welt und älter als 8 Wochen? Alle aktuellen Kurse sind voll belegt. Du kommst mit dieser Anfrage automatisch auf die Warteliste für einen „Nachrückerplatz“ falls sich Kapazitäten ergeben.

Sobald wir in die Planung für weitere Kurse gehen und Dir einen Platz anbieten können, melden wir uns wieder bei Dir.

Bis dahin wünschen wir alles Gute und hoffen ihr könnt diese unglaubliche und aufregende Zeit richtig genießen.

Alles liebe!

Deine PEKiP Gruppenleitungen`;

            const pekipHtml = `
<p>Liebe/t ${req.body.name},</p>
<p>vielen Dank für Dein Interesse an einem PEKiP Kurs.</p>
<p><strong>Ist Dein Baby noch nicht auf der Welt:</strong></p>
<p>Durch diese Anfrage wirst Du automatisch auf der Interessentenliste eingetragen. In der Regel beginnt die Planung für die Kurse ca. 3-4 Wochen vor Beginn.</p>
<p>Wir machen die Altersspanne der neuen Kurse immer auch von der Nachfrage abhängig. Daher können wir jetzt noch nicht sagen, an welchem Tag und zu welcher Uhrzeit, der für Dich passende Kurs stattfinden wird.</p>
<p><strong>Ist Dein Baby schon auf der Welt und älter als 8 Wochen?</strong> </p>
<p>Alle aktuellen Kurse sind voll belegt. Du kommst mit dieser Anfrage automatisch auf die Warteliste für einen „Nachrückerplatz“ falls sich Kapazitäten ergeben.</p>
<p>Sobald wir in die Planung für weitere Kurse gehen und Dir einen Platz anbieten können, melden wir uns wieder bei Dir.</p>
<p>Bis dahin wünschen wir alles Gute und hoffen ihr könnt diese unglaubliche und aufregende Zeit richtig genießen.</p>
<p>Alles liebe!</p>
<p>Deine PEKiP Gruppenleitungen</p>`;

            const userMailOptions = {
                from: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
                // from: "info@mainglueckskind.de",
                to: req.body.email,
                subject: "Anmelde Bestätigung",
                text: "req.body.isPekip ? pekipText : nonPekipText",
                html: "req.body.isPekip ? pekipHtml : nonPekipHtml",
            };

            const adminMailOptions = {
                from: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
                to: process.env.NEXT_DEV === "true" ? "office@atelierbuchner.at" : process.env.NEXT_W4YUSER, // Replace with your admin email
                // cc: "info@mainglueckskind.de", // CC email

                subject: `Neuer User hat sich regisrtiert`,
                html: `
             <p>Neuer User da</p>`,
            };

            // Send emails
            await transporter.sendMail(userMailOptions);
            await transporter.sendMail(adminMailOptions);

            res.status(200).json({ message: "Anmeldung erfolgreich gespeichert und bestätigt" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Fehler bei der Verarbeitung Ihrer Anfrage" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
