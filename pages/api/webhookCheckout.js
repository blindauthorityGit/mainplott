// pages/api/webhookCheckout.js

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end("Method Not Allowed");
    }

    // Next.js parst application/json automatisch in req.body
    console.log("🛒 Shopify Checkout Webhook Payload:");
    console.dir(req.body, { depth: null });

    // Shopify will retry, wenn kein 2xx kommt
    res.status(200).json({ received: true });
}
