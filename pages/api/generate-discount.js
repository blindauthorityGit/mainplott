// pages/api/generate-discount.js

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { amount, currency = "EUR", prefix = "RABATT" } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid discount amount." });
    }

    const adminToken = process.env.SHOPIFY_STOREFRONT_ADMIN_API;
    const shop = process.env.SHOPIFY_STORE_DOMAIN;

    // Generate a random code, e.g. "RABATT-ABC123"
    const discountCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    /**
     * For 2023-10, the 'discountCodeBasicCreate' mutation expects:
     *   basicCodeDiscount: DiscountCodeBasicInput
     *
     * Return fields are on 'basicCodeDiscountCreatePayload' which has
     *   basicCodeDiscount { id, code, title, ... }
     *   userErrors { ... }
     */
    const mutation = `
      mutation {
        discountCodeBasicCreate(
          basicCodeDiscount: {
            title: "${discountCode}",
            code: "${discountCode}",
            startsAt: "${new Date().toISOString()}",
            usageLimit: 1,
            appliesOncePerCustomer: true,
            customerSelection: { all: true },
            combinesWith: {
              orderDiscounts: false,
              productDiscounts: false,
              shippingDiscounts: false
            },
            customerGets: {
              value: {
                discountAmount: {
                  amount: "${amount}",
                  appliesOnEachItem: false
                }
              },
              items: { all: true }
            }
          }
        ) {
          basicCodeDiscount {
            id
            code
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
        const response = await fetch(`https://${shop}/admin/api/2023-07/graphql.json`, {
            method: "POST",
            headers: {
                "X-Shopify-Access-Token": adminToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: mutation }),
        });

        const json = await response.json();

        if (json.errors) {
            console.error("Shopify GraphQL Errors:", json.errors);
            return res.status(500).json({ error: "Failed to create discount code (GraphQL errors)." });
        }

        const userErrors = json?.data?.discountCodeBasicCreate?.userErrors;
        if (userErrors && userErrors.length > 0) {
            console.error("Shopify User Errors:", userErrors);
            return res.status(500).json({ error: "Failed to create discount code (User errors)." });
        }

        // Grab the 'basicCodeDiscount' object
        const discountObj = json.data?.discountCodeBasicCreate?.basicCodeDiscount;
        if (!discountObj?.code) {
            console.error("No code returned by Shopify:", json);
            return res.status(500).json({ error: "No code returned by Shopify" });
        }

        // The 'code' field is your newly created coupon code
        return res.status(200).json({ code: discountObj.code });
    } catch (error) {
        console.error("Shopify createDiscount Error:", error);
        return res.status(500).json({ error: "Failed to create discount code (Exception)." });
    }
}
