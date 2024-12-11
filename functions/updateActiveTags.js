import findValue from "./findValue"; // Import your existing findValue function

const updateActiveTags = (categories, activeCategory, setActiveTags) => {
    const activeCategoryObject = findValue(categories, "value", activeCategory);
    console.log("activeCategoryObject", activeCategoryObject, categories, "value", activeCategory);
    if (activeCategoryObject) {
        let tags = [];

        if (activeCategoryObject.subcategories) {
            // Case 1: Subcategories exist
            activeCategoryObject.subcategories.forEach((subCategory) => {
                if (subCategory.subSubcategories?.length) {
                    // Add subSubcategories if they exist
                    tags = [...tags, ...subCategory.subSubcategories.map((subSub) => subSub.name)];
                } else {
                    // Otherwise, use the subcategory name itself
                    tags.push(subCategory.name);
                }
            });
        } else {
            // Case 2: No subcategories, use the active category directly
            tags = [activeCategoryObject.name];
        }

        // Update the active tags
        setActiveTags(tags);
        console.log("Updated active tags:", tags);
    } else {
        // Reset active tags if no matching category is found
        setActiveTags([]);
        console.log("No matching active category found. Active tags reset.");
    }
};

export default updateActiveTags;
