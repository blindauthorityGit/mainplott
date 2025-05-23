// pages/api/webhookCheckout.js
import nodemailer from "nodemailer";

export const config = {
    api: {
        bodyParser: true, // wir lesen JSON direkt
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const payload = req.body;

        // 1) Alle “normalen” Produkte extrahieren (inkl. Größe)
        const products = payload.line_items
            .filter((item) => !/Veredelung/i.test(item.title))
            .map((item) => ({
                name: item.title,
                size: item.variant_title, // z.B. "XS / lime"
                quantity: item.quantity,
                price: item.price,
            }));

        // 2) Alle Veredelungen extrahieren (inkl. Fallback‐Position)
        const veredelungen = payload.line_items
            .filter((item) => {
                const props = item.properties || {};
                return Object.keys(props).some((k) => /^uploadedGraphic_/i.test(k));
            })
            .map((item) => {
                const props = item.properties || {};
                const placement = props.Platzierung || null;
                const sides = {};

                Object.entries(props).forEach(([k, v]) => {
                    let m;
                    if ((m = /^uploadedGraphic_(.+)$/i.exec(k))) {
                        sides[m[1]] = sides[m[1]] || {};
                        sides[m[1]].graphic = v;
                    }
                    if ((m = /^designURL_(.+)$/i.exec(k))) {
                        sides[m[1]] = sides[m[1]] || {};
                        sides[m[1]].design = v;
                    }
                });

                return {
                    title: item.title,
                    quantity: item.quantity,
                    placement, // z.B. "Brust rechts oben"
                    sides,
                };
            });

        // 3) Transporter konfigurieren
        const transporter = nodemailer.createTransport({
            host: "smtp.world4you.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
                pass: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YPASSWORD : process.env.NEXT_W4YPASSWORD,
            },
        });

        // 4) Plain‐Text Body bauen
        let textBody = `Neue Checkout‐Event eingegangen:\n\n`;
        textBody += `📦 Produkte:\n`;
        for (const p of products) {
            textBody += ` - ${p.name} (${p.size}) × ${p.quantity} à €${p.price}\n`;
        }

        textBody += `\n🎨 Veredelungen:\n`;
        for (const v of veredelungen) {
            textBody += ` - ${v.title} × ${v.quantity}\n`;
            for (const [side, links] of Object.entries(v.sides)) {
                if (links.graphic) {
                    textBody += `     • ${side}: Grafik → ${links.graphic}\n`;
                } else if (v.placement) {
                    textBody += `     • ${side}: Position → ${v.placement}\n`;
                }
                if (links.design) {
                    textBody += `     • ${side}: Design  → ${links.design}\n`;
                }
            }
        }

        // Falls Kunde eine Notiz hinterlassen hat:
        if (payload.note) {
            textBody += `\n📝 Kunden‐Notiz:\n${payload.note}\n`;
        }

        // 5) HTML‐Body bauen
        let htmlBody = `
      <h2>Neue Checkout‐Event eingegangen</h2>
      <h3>📦 Produkte:</h3>
      <ul>
        ${products
            .map((p) => `<li><strong>${p.name}</strong> (${p.size}) × ${p.quantity} &agrave; €${p.price}</li>`)
            .join("")}
      </ul>

      <h3>🎨 Veredelungen:</h3>
      <ul>
        ${veredelungen
            .map((v) => {
                const sideLines = Object.entries(v.sides)
                    .map(([side, links]) => {
                        // Fallback auf Position, wenn keine Grafik existiert
                        let line = `<li>${side.charAt(0).toUpperCase() + side.slice(1)}: `;
                        if (links.graphic) {
                            line += `<a href="${links.graphic}">Grafik</a>`;
                        } else if (v.placement) {
                            line += `Position: ${v.placement}`;
                        }
                        if (links.design) {
                            line += ` | <a href="${links.design}">Design</a>`;
                        }
                        return line + `</li>`;
                    })
                    .join("");
                return `<li>
              <strong>${v.title}</strong> × ${v.quantity}
              <ul>${sideLines}</ul>
            </li>`;
            })
            .join("")}
      </ul>
    `;

        if (payload.note) {
            htmlBody += `
        <h3>📝 Kunden‐Notiz:</h3>
        <p>${payload.note}</p>
      `;
        }

        // 6) Mail‐Options
        const mailOptions = {
            from: process.env.NEXT_DEV === "true" ? process.env.NEXT_W4YUSER : process.env.NEXT_W4YUSER,
            to: process.env.NEXT_DEV === "true" ? "office@atelierbuchner.at" : process.env.NEXT_W4YUSER, // Admin‐Mail
            subject: `🛒 Neuer Checkout #${payload.name || payload.token}`,
            text: textBody,
            html: htmlBody,
        };

        // 7) Mail senden
        await transporter.sendMail(mailOptions);

        // 8) Shopify antworten
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Fehler in /api/webhookCheckout:", error);
        return res.status(500).json({ error: "Fehler beim Verarbeiten des Webhooks" });
    }
}
