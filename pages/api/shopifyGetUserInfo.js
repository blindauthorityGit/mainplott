export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const emailRaw = (body.email || "").trim();
    if (!emailRaw) return res.status(400).json({ error: "Missing email" });

    const shop = (process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "")
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
    const token =
        process.env.SHOPIFY_ADMIN_TOKEN || // <— bevorzugt
        process.env.SHOPIFY_STOREFRONT_ADMIN_API || // fallback, wenn du das gerade nutzt
        process.env.SHOPIFY_STOREFRONT_ADMIN_API_LIVE;

    if (!shop || !token) {
        return res.status(500).json({ error: "Shopify env missing", debug: { shop, hasToken: !!token } });
    }

    const q = `email:"${emailRaw.toLowerCase()}"`;

    try {
        // 1) REST: /customers/search → id + admin_graphql_api_id
        const searchUrl = `https://${shop}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(q)}`;
        const s = await fetch(searchUrl, { headers: { "X-Shopify-Access-Token": token } });
        const sJson = await s.json().catch(() => null);
        const c0 = Array.isArray(sJson) ? sJson[0] : sJson?.customers?.[0];
        const gid = c0?.admin_graphql_api_id || (c0?.id ? `gid://shopify/Customer/${c0.id}` : null);
        const idNum = c0?.id || (gid ? gid.split("/").pop() : null);

        if (!idNum) return res.status(200).json({ customer: null, debug: { stage: "search-empty", shop, q } });

        // 2) REST: /customers/{id}.json (volle Felder)
        const fields = ["id", "email", "first_name", "last_name", "phone", "tags", "default_address", "addresses"].join(
            ","
        );
        const byIdUrl = `https://${shop}/admin/api/2024-10/customers/${idNum}.json?fields=${fields}`;
        const r = await fetch(byIdUrl, { headers: { "X-Shopify-Access-Token": token } });
        const rJson = await r.json().catch(() => null);
        const c = rJson?.customer;
        if (!r.ok || !c) {
            return res
                .status(r.status || 200)
                .json({ customer: null, error: "REST by ID failed", details: rJson, debug: { shop, idNum, gid } });
        }

        const mapAddr = (a) =>
            a
                ? {
                      id: a.id,
                      address1: a.address1 || null,
                      address2: a.address2 || null,
                      city: a.city || null,
                      zip: a.zip || null,
                      country: a.country || null,
                      province: a.province || null,
                      phone: a.phone || null,
                      name: a.name || null,
                      company: a.company || null,
                      default: !!a.default,
                  }
                : null;

        const customer = {
            id: gid || (c.id ? `gid://shopify/Customer/${c.id}` : null),
            email: c.email || null,
            firstName: c.first_name || null,
            lastName: c.last_name || null,
            phone: c.phone || null,
            tags: (c.tags || "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            defaultAddress: mapAddr(c.default_address),
            addresses: Array.isArray(c.addresses) ? c.addresses.map(mapAddr) : [],
        };

        return res.status(200).json({ source: "rest-by-id", customer, debug: { shop, q, gid, idNum } });
    } catch (e) {
        console.error("ShopifyGetUserInfo fatal:", e);
        return res.status(500).json({ error: e.message || "Unexpected error" });
    }
}
