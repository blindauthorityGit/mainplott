import { getAllProducts, getAllProductsInCollection } from "../../libs/shopify";

// Example: serverless function for filtering products based on cat and tags.
// cat and tags are union-based: multiple categories => union of all products from those categories,
// multiple tags => union of all products having any of those tags.

export default async function handler(req, res) {
    const { cat = "streetwear", tags = "" } = req.query;

    // Decode categories
    const categories =
        cat.toLowerCase() === "all"
            ? []
            : cat
                  .split("+")
                  .map((c) => c.trim())
                  .filter(Boolean);
    const activeTags = tags
        ? tags
              .split("+")
              .map((t) => t.trim())
              .filter(Boolean)
        : [];

    let allProducts = [];

    if (categories.length === 0 && cat.toLowerCase() === "all") {
        // If 'all', just fetch all products
        allProducts = await getAllProducts();
    } else {
        // If we have categories, fetch products from each category and combine them.
        // This is a union: products from any listed category.
        // If multiple categories: get products from each and merge.
        let categoryProducts = [];
        for (const c of categories) {
            const productsInCat = await getAllProductsInCollection(c);
            categoryProducts = [...categoryProducts, ...productsInCat];
        }
        // Remove duplicates if needed
        const seen = new Set();
        allProducts = categoryProducts.filter((p) => {
            const id = p.node.id;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }

    // Now filter by tags (union logic):
    // If no tags are given, we already have the category-based set.
    // If tags exist, return products that have at least one of the tags.
    let filteredProducts = allProducts;
    if (activeTags.length > 0) {
        filteredProducts = allProducts.filter((product) => product.node.tags.some((tag) => activeTags.includes(tag)));
    }

    res.status(200).json({ products: filteredProducts });
}
