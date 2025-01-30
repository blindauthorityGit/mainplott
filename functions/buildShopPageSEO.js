// helpers/buildShopPageSEO.js

/**
 * Build a dynamic SEO object for the shop page,
 * depending on selected categories, tags, etc.
 */
export default function buildShopPageSEO(selectedCats, selectedTags) {
    // If "all" is present, treat it as "Alle Kategorien"
    const catDisplay = selectedCats.includes("all") ? "Alle Kategorien" : selectedCats.join(", ");

    let pageTitle = `Shop – ${catDisplay}`;

    // If there are tags, add them to the title or description
    if (selectedTags && selectedTags.length > 0) {
        pageTitle += ` – Tags: ${selectedTags.join(", ")}`;
    }

    // Maybe a brief dynamic description:
    const metaDescription = `Auf dieser Seite findest du alle Produkte in den Kategorien: ${catDisplay}. 
      Tags: ${selectedTags.join(", ")}.`;

    // You can accumulate keywords from both categories & tags
    const keywords = [...selectedCats, ...selectedTags];

    return {
        mainSEO: {
            title: pageTitle,
            description: metaDescription,
            keywords: keywords,
        },
        advancedSEO: {
            // Optionally set an OG image for the shop page
            ogImage: "https://yourdomain.com/images/defaultShopOgImage.jpg",
        },
    };
}
