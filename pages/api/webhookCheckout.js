// pages/api/webhookCheckout.js

export const config = {
    api: {
        bodyParser: true, // wir lesen JSON direkt
    },
};

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end("Method Not Allowed");
    }

    const payload = req.body;

    // 1) Alle “normalen” Produkte extrahieren
    const products = payload.line_items
        .filter((item) => !/Veredelung/i.test(item.title))
        .map((item) => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
        }));

    // 2) Alle Veredelungen extrahieren (Line Items mit uploadedGraphic_* in properties)
    const veredelungen = payload.line_items
        .filter((item) => {
            const props = item.properties || {};
            return Object.keys(props).some((k) => /^uploadedGraphic_/i.test(k));
        })
        .map((item) => {
            const props = item.properties || {};
            // finde alle Seiten („front“, „back“, …)
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
                sideLinks: sides,
            };
        });

    console.log("👉 Produkte:", products);
    console.log("👉 Veredelungen:", veredelungen);

    // antworte Shopify
    res.status(200).json({ received: true });
}
