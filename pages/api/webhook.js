export default async function handler(req, res) {
    console.log(req, res);
    console.log("WEBGOOK");
    if (req.method === "POST") {
        // Parse the incoming webhook payload
        const webhookPayload = req.body;

        // Example: Trigger an action (e.g., send an email on successful purchase)
        if (webhookPayload.topic === "orders/paid") {
            // Add your custom logic here
            console.log("Order Paid:", webhookPayload);

            // Send email or trigger any function here
        }

        // Respond to Shopify to acknowledge the webhook
        res.status(200).send("Webhook received");
    } else {
        console.log("WEBGOOK ERROR");

        res.status(405).send("Method Not Allowed");
    }
}
