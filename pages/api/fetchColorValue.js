export default async function handler(req, res) {
    const { metafieldId } = req.query;
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    try {
        const response = await fetch(`https://${domain}/admin/api/2023-01/metafields/${metafieldId}.json`, {
            method: "GET",
            headers: {
                "X-Shopify-Access-Token": token,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // Debugging
            throw new Error(`Failed to fetch data from Shopify API - Status: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json({ hexValue: data.metafield.value });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching hex color value" });
    }
}
