// pages/api/webhookCheckout.js
import nodemailer from "nodemailer";

export const config = {
    api: {
        bodyParser: true, // wir lesen JSON direkt
    },
};

// Shopify kann properties als Array [{name,value}] ODER als Object liefern.
// Wir normalisieren in ein plain object.
function normalizeProps(properties) {
    if (!properties) return {};
    if (Array.isArray(properties)) {
        const out = {};
        for (const p of properties) {
            const k = p?.name ?? p?.key;
            const v = p?.value;
            if (k != null) out[String(k)] = v;
        }
        return out;
    }
    if (typeof properties === "object") return properties;
    return {};
}

function inferSideFromTitle(title = "") {
    const t = String(title).toLowerCase();
    // an eure Begriffe angepasst
    if (t.includes("rücken") || t.includes("ruecken") || t.includes("back")) return "back";
    if (t.includes("brust") || t.includes("front")) return "front";
    return null;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const payload = req.body;

        // 1) Normale Produkte extrahieren (nicht Veredelung)
        const products = (payload.line_items || [])
            .filter((item) => !/Veredelung/i.test(item.title))
            .map((item) => ({
                name: item.title,
                size: item.variant_title, // z.B. "XS / lime"
                quantity: item.quantity,
                price: item.price,
            }));

        // 2) Veredelungen extrahieren (neue Keys!)
        const veredelungen = (payload.line_items || [])
            .filter((item) => /Veredelung/i.test(item.title))
            .map((item) => {
                const props = normalizeProps(item.properties);

                // wir sammeln pro "side" die Links
                const sides = {};

                // a) uploadedGraphic_front / uploadedGraphic_back (+ optional suffix _2, _3 ...)
                //    wir akzeptieren:
                //    uploadedGraphic_front
                //    uploadedGraphic_front_2
                //    uploadedGraphic_back
                //    uploadedGraphic_back_2
                for (const [k, v] of Object.entries(props)) {
                    const m = /^uploadedGraphic_(front|back)(?:_(\d+))?$/i.exec(k);
                    if (!m) continue;
                    const side = m[1].toLowerCase();
                    const idx = m[2] ? Number(m[2]) : 1;
                    sides[side] = sides[side] || { graphics: [], design: null };
                    if (v) sides[side].graphics.push({ idx, url: String(v) });
                }

                // b) Design (steht jetzt ohne Suffix im LineItem)
                //    Da der Key "Design" side-neutral ist, ordnen wir ihn sinnvoll zu:
                //    - wenn genau eine side existiert -> dahin
                //    - sonst via title inference
                //    - sonst als _global
                if (props.Design) {
                    const designUrl = String(props.Design);

                    const existingSides = Object.keys(sides);
                    if (existingSides.length === 1) {
                        sides[existingSides[0]].design = designUrl;
                    } else {
                        const inferred = inferSideFromTitle(item.title);
                        if (inferred) {
                            sides[inferred] = sides[inferred] || { graphics: [], design: null };
                            sides[inferred].design = designUrl;
                        } else {
                            sides._global = sides._global || { graphics: [], design: null };
                            sides._global.design = designUrl;
                        }
                    }
                }

                // c) Platzierung (bleibt wie vorher)
                const placement = props.Platzierung || null;

                // d) Fallback: falls keine uploadedGraphic_* existiert, aber Design da ist
                //    (dann steht es evtl. als _global oder inferred)
                return {
                    title: item.title,
                    quantity: item.quantity,
                    placement,
                    sides,
                };
            })
            // nur behalten, wenn wirklich relevante Infos drin sind
            .filter((v) => {
                const allSides = Object.values(v.sides || {});
                return (
                    allSides.some((s) => (s?.graphics || []).length > 0) ||
                    allSides.some((s) => Boolean(s?.design)) ||
                    Boolean(v.placement)
                );
            });

        // 3) Transporter konfigurieren
        const transporter = nodemailer.createTransport({
            host: "smtp.world4you.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NEXT_W4YUSER,
                pass: process.env.NEXT_W4YPASSWORD,
            },
        });

        // 4) Plain-Text Body bauen
        let textBody = `Neue Bestellung eingegangen:\n\n`;
        textBody += `📦 Produkte:\n`;
        for (const p of products) {
            textBody += ` - ${p.name} (${p.size}) × ${p.quantity} à €${p.price}\n`;
        }

        textBody += `\n🎨 Veredelungen:\n`;
        for (const v of veredelungen) {
            textBody += ` - ${v.title} × ${v.quantity}\n`;
            if (v.placement) textBody += `     • Platzierung: ${v.placement}\n`;

            for (const [side, links] of Object.entries(v.sides || {})) {
                const sideLabel =
                    side === "front" ? "front" : side === "back" ? "back" : side === "_global" ? "global" : side;

                // graphics
                const graphics = (links?.graphics || []).sort((a, b) => (a.idx || 0) - (b.idx || 0)).map((g) => g.url);

                for (const url of graphics) {
                    textBody += `     • ${sideLabel}: Grafik → ${url}\n`;
                }

                // design
                if (links?.design) {
                    textBody += `     • ${sideLabel}: Design → ${links.design}\n`;
                }
            }
        }

        if (payload.note) {
            textBody += `\n📝 Kunden-Notiz:\n${payload.note}\n`;
        }

        // 5) HTML Body bauen
        const htmlProducts = products
            .map((p) => `<li><strong>${p.name}</strong> (${p.size}) × ${p.quantity} &agrave; €${p.price}</li>`)
            .join("");

        const htmlVeredelungen = veredelungen
            .map((v) => {
                const sideLines = Object.entries(v.sides || {})
                    .map(([side, links]) => {
                        const sideLabel =
                            side === "front"
                                ? "Front"
                                : side === "back"
                                  ? "Back"
                                  : side === "_global"
                                    ? "Global"
                                    : side;

                        const graphics = (links?.graphics || [])
                            .sort((a, b) => (a.idx || 0) - (b.idx || 0))
                            .map((g) => `<a href="${g.url}">Grafik</a>`);

                        const design = links?.design ? `<a href="${links.design}">Design</a>` : "";

                        let bits = [];
                        if (graphics.length) bits.push(graphics.join(" | "));
                        if (design) bits.push(design);
                        if (!bits.length && v.placement) bits.push(`Position: ${v.placement}`);

                        return `<li>${sideLabel}: ${bits.join(" | ")}</li>`;
                    })
                    .join("");

                const placementLine = v.placement ? `<div><em>Platzierung:</em> ${v.placement}</div>` : "";

                return `<li>
                    <strong>${v.title}</strong> × ${v.quantity}
                    ${placementLine}
                    <ul>${sideLines}</ul>
                </li>`;
            })
            .join("");

        let htmlBody = `
            <h2>Neue Bestellung eingegangen</h2>
            <h3>📦 Produkte:</h3>
            <ul>${htmlProducts}</ul>

            <h3>🎨 Veredelungen:</h3>
            <ul>${htmlVeredelungen}</ul>
        `;

        if (payload.note) {
            htmlBody += `
                <h3>📝 Kunden-Notiz:</h3>
                <p>${payload.note}</p>
            `;
        }

        // 6) Mail Options
        const mailOptions = {
            from: process.env.NEXT_W4YUSER,
            to: process.env.NEXT_DEV === "true" ? "office@atelierbuchner.at" : process.env.NEXT_W4YUSER,
            subject: `🛒 Neue Bestellung ${payload.name || payload.id || payload.token || ""}`.trim(),
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
