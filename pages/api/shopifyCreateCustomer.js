// pages/api/shopifyCreateCustomer.js
export default async function handler(req, res) {
    console.log("Shopify Token:", process.env.SHOPIFY_STOREFRONT_ADMIN_API);

    console.log("BIN DA");
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, userType, businessNumber, companyName } = req.body;

    console.log(email, userType, businessNumber, companyName);

    try {
        const response = await fetch(`https://b1d160-0f.myshopify.com/admin/api/2023-10/customers.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": process.env.SHOPIFY_STOREFRONT_ADMIN_API,
            },
            body: JSON.stringify({
                customer: {
                    email: email,
                    tags: userType === "firmenkunde" ? "FIRMENKUNDE" : "PRIVATKUNDE",
                    metafields: [
                        {
                            key: "businessNumber",
                            value: businessNumber || "",
                            value_type: "string",
                            namespace: "custom",
                            type: "single_line_text_field", // Correct metafield type
                        },
                        {
                            key: "companyName",
                            value: companyName || "",
                            value_type: "string",
                            namespace: "custom",
                            type: "single_line_text_field", // Correct metafield type
                        },
                    ],
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data.errors));
        }

        return res.status(200).json({ success: true, customer: data.customer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}
