export default async function handler(req, res) {
    if (req.method === "POST") {
        // Parse the incoming webhook payload
        const webhookPayload = req.body;

        // Example: Trigger an action (e.g., send an email on successful purchase)
        if (webhookPayload.topic === "orders/paid") {
            // Add your custom logic here
            // Send email or trigger any function here
        }

        // Respond to Shopify to acknowledge the webhook
        res.status(200).send("Webhook received");
    } else {
        res.status(405).send("Method Not Allowed");
    }
}
