// pages/api/webhook.js

import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        const payload = req.body;

        // Shopify Webhook Topic kommt im Header
        const topic = req.headers["x-shopify-topic"];

        if (topic !== "orders/paid") {
            return res.status(200).send("Ignored");
        }

        console.log("✅ orders/paid webhook received");

        const lineItems = payload.line_items || [];

        // --- Helper: normalize Shopify properties ---
        function normalizeProps(properties) {
            if (!properties) return {};
            if (Array.isArray(properties)) {
                const out = {};
                for (const p of properties) {
                    const key = p?.name ?? p?.key;
                    if (key) out[key] = p.value;
                }
                return out;
            }
            if (typeof properties === "object") return properties;
            return {};
        }

        // --- Produkte (ohne Veredelung) ---
        const products = lineItems
            .filter((item) => !/Veredelung/i.test(item.title))
            .map((item) => ({
                name: item.title,
                variant: item.variant_title,
                quantity: item.quantity,
                price: item.price,
            }));

        // --- Veredelungen ---
        const decorations = lineItems
            .filter((item) => /Veredelung/i.test(item.title))
            .map((item) => {
                const props = normalizeProps(item.properties);

                const sides = {
                    front: { graphics: [], design: null },
                    back: { graphics: [], design: null },
                };

                for (const [k, v] of Object.entries(props)) {
                    // uploadedGraphic_front / uploadedGraphic_back / _2 etc.
                    const m = /^uploadedGraphic_(front|back)(?:_\d+)?$/i.exec(k);
                    if (m && v) {
                        sides[m[1].toLowerCase()].graphics.push(String(v));
                    }

                    if (k === "Design" && v) {
                        // Wir wissen anhand des LineItems ob es Front oder Back ist
                        const lowerTitle = item.title.toLowerCase();
                        if (lowerTitle.includes("brust") || lowerTitle.includes("front")) {
                            sides.front.design = String(v);
                        } else if (lowerTitle.includes("rücken") || lowerTitle.includes("back")) {
                            sides.back.design = String(v);
                        } else {
                            // fallback
                            sides.front.design = String(v);
                        }
                    }
                }

                return {
                    title: item.title,
                    quantity: item.quantity,
                    placement: props.Platzierung || null,
                    sides,
                };
            });

        // --------------------------
        // EMAIL GENERIEREN
        // --------------------------

        let textBody = `Neue Bestellung eingegangen\n\n`;
        textBody += `Bestellnummer: ${payload.name}\n`;
        textBody += `Kunde: ${payload.customer?.first_name || ""} ${payload.customer?.last_name || ""}\n`;
        textBody += `Email: ${payload.email}\n\n`;

        textBody += `📦 PRODUKTE:\n`;
        for (const p of products) {
            textBody += ` - ${p.name} (${p.variant}) × ${p.quantity} à €${p.price}\n`;
        }

        textBody += `\n🎨 VEREDELUNGEN:\n`;
        for (const d of decorations) {
            textBody += ` - ${d.title} × ${d.quantity}\n`;
            if (d.placement) textBody += `   Platzierung: ${d.placement}\n`;

            if (d.sides.front.graphics.length) {
                for (const g of d.sides.front.graphics) {
                    textBody += `   Front Grafik: ${g}\n`;
                }
            }
            if (d.sides.front.design) {
                textBody += `   Front Design: ${d.sides.front.design}\n`;
            }

            if (d.sides.back.graphics.length) {
                for (const g of d.sides.back.graphics) {
                    textBody += `   Back Grafik: ${g}\n`;
                }
            }
            if (d.sides.back.design) {
                textBody += `   Back Design: ${d.sides.back.design}\n`;
            }
        }

        // --- HTML Version ---
        const htmlBody = `
            <h2>🛒 Neue Bestellung eingegangen</h2>
            <p><strong>Bestellnummer:</strong> ${payload.name}</p>
            <p><strong>Kunde:</strong> ${payload.customer?.first_name || ""} ${payload.customer?.last_name || ""}</p>
            <p><strong>Email:</strong> ${payload.email}</p>

            <h3>📦 Produkte</h3>
            <ul>
                ${products
                    .map(
                        (p) => `<li><strong>${p.name}</strong> (${p.variant}) × ${p.quantity} &mdash; €${p.price}</li>`,
                    )
                    .join("")}
            </ul>

            <h3>🎨 Veredelungen</h3>
            <ul>
                ${decorations
                    .map((d) => {
                        return `
                        <li>
                            <strong>${d.title}</strong> × ${d.quantity}
                            ${d.placement ? `<div>Platzierung: ${d.placement}</div>` : ""}
                            <ul>
                                ${
                                    d.sides.front.graphics.length
                                        ? d.sides.front.graphics
                                              .map((g) => `<li>Front Grafik: <a href="${g}">${g}</a></li>`)
                                              .join("")
                                        : ""
                                }
                                ${
                                    d.sides.front.design
                                        ? `<li>Front Design: <a href="${d.sides.front.design}">${d.sides.front.design}</a></li>`
                                        : ""
                                }
                                ${
                                    d.sides.back.graphics.length
                                        ? d.sides.back.graphics
                                              .map((g) => `<li>Back Grafik: <a href="${g}">${g}</a></li>`)
                                              .join("")
                                        : ""
                                }
                                ${
                                    d.sides.back.design
                                        ? `<li>Back Design: <a href="${d.sides.back.design}">${d.sides.back.design}</a></li>`
                                        : ""
                                }
                            </ul>
                        </li>
                        `;
                    })
                    .join("")}
            </ul>
        `;

        // --- Mail Transport ---
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: process.env.NEXT_DEV === "true" ? "office@atelierbuchner.at" : process.env.MAIL_TO,
            subject: `Neue Bestellung ${payload.name}`,
            text: textBody,
            html: htmlBody,
        });

        return res.status(200).send("Webhook processed");
    } catch (err) {
        console.error("Webhook error:", err);
        return res.status(500).send("Internal Server Error");
    }
}
