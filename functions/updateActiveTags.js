// functions/updateActiveTags.js

import findValue from "./findValue"; // Import your existing findValue function

const updateActiveTags = (categories, activeCategory, setActiveTags) => {
    const activeCategoryObject = findValue(categories, "value", activeCategory);
    console.log(activeCategoryObject);
    if (activeCategoryObject) {
        // Get all subSubcategories of the active category
        const subSubcategories = activeCategoryObject.subSubcategories.flatMap((subCategory) => subCategory.name);

        // Update the active tags
        setActiveTags(subSubcategories);
        console.log("Updated active tags:", subSubcategories);
    }
};

export default updateActiveTags;
