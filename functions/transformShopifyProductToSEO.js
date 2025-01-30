/**
 * Cleans up HTML in the product description (removes <p>, <br>, etc.).
 * You could also do more advanced slicing if you want to limit meta descriptions
 * to ~160 characters.
 */
function stripHtml(htmlString) {
    if (!htmlString) return "";
    return htmlString.replace(/<[^>]+>/g, "").trim();
}

/**
 * Transform Shopify product data into the SEO shape expected by MetaShopify
 */
export default function transformShopifyProductToSEO(productData) {
    // Safely extract bits from productData
    const { title = "", descriptionHtml = "", tags = [], images } = productData || {};

    // 1) A fallback meta description.
    const metaDescription = stripHtml(descriptionHtml);

    // 2) Basic keywords from Shopify tags array.
    const keywords = tags; // or you can merge with other relevant keywords

    // 3) Attempt to grab first product image for social media preview.
    let ogImage = null;
    if (images && images.edges && images.edges.length > 0) {
        ogImage = images.edges[0].node.originalSrc;
    }

    return {
        mainSEO: {
            title: title || "Produkt-Detailseite", // fallback if none
            description: metaDescription || "Standard-Fallback-Beschreibung",
            keywords: keywords, // e.g. ["Workwear", "Hoodies", ...]
        },
        advancedSEO: {
            // The plugin uses data.advancedSEO.ogImage for the OG image
            ogImage: ogImage,
        },
    };
}
