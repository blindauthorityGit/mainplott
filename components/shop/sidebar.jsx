import { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Chevron Icons
import useStore from "../../store/store"; // Pfad zu deinem Zustand-Store

//FUNCTIONS
import findValue from "@/functions/findValue";
import updateActiveTags from "../../functions/updateActiveTags";

export default function Sidebar({ categories }) {
    const [openCategory, setOpenCategory] = useState("Textilveredelung"); // Set active category initially
    const [openSubCategory, setOpenSubCategory] = useState("Streetwear"); // Track which subcategory is open
    const { activeCategory, setActiveCategory, activeTags, addTag, removeTag, setActiveTags } = useStore();

    const handleCategoryChange = (category) => {
        setActiveCategory(category); // Setzt die neue aktive Kategorie
    };

    useEffect(() => {
        updateActiveTags(categories, activeCategory, setActiveTags);
    }, [categories, activeCategory, setActiveTags]);

    // Setze die Checkboxen basierend auf der aktiven Hauptkategorie
    useEffect(() => {
        const selectedCategory = categories?.find((cat) => cat.name.toLowerCase() === activeCategory.toLowerCase());
        console.log(categories);

        if (selectedCategory) {
            // Hole alle Tags in den SubSubCategories der aktiven MainCat (z.B. Streetwear)
            const tags = selectedCategory.subcategories.flatMap((sub) =>
                sub.subSubcategories.map((subSub) => subSub.value)
            );

            console.log(tags);
            // Setze die aktiven Tags entsprechend den SubSubCategories der aktiven MainCat
            setActiveTags(tags);
        }
    }, [activeCategory, categories, setActiveTags]);

    const handleTagChange = (tag) => {
        if (activeTags.includes(tag)) {
            removeTag(tag); // Tag entfernen, wenn es bereits ausgewählt ist
        } else {
            addTag(tag); // Tag hinzufügen, wenn es nicht ausgewählt ist
        }
    };

    useEffect(() => {
        console.log(activeTags);
    }, [activeTags]);
    // Toggle main category (Accordion)
    const handleCategoryToggle = (category) => {
        if (openCategory === category) {
            setOpenCategory(null); // Close if it's already open
        } else {
            setOpenCategory(category); // Open the selected one
        }
    };

    // Toggle subcategory (Accordion)
    const handleSubCategoryToggle = (subCategory) => {
        if (openSubCategory === subCategory) {
            setOpenSubCategory(null); // Close if it's already open
        } else {
            setOpenSubCategory(subCategory); // Open the selected one
        }
    };

    // Cleanup effect to reset activeTags when the sidebar is unmounted
    useEffect(() => {
        return () => {
            setActiveTags([]); // Clear active tags when component unmounts
        };
    }, [setActiveTags]);

    return (
        <div className="bg-white rounded-2xl my-12 p-4 shadow-md w-full lg:col-span-2 max-w-xs font-body">
            {categories.map((category) => (
                <div key={category.name} className="mb-4">
                    {/* Category Title */}
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleCategoryToggle(category.name)}
                    >
                        <h4 className="text-lg font-bold">{category.name} </h4>
                        {openCategory === category.name ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </div>

                    {/* Subcategories (only shown when the category is open) */}
                    {openCategory === category.name && (
                        <div className="pl-4 mt-2">
                            {category.subcategories.map((subCategory) => (
                                <div key={subCategory.name}>
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => handleSubCategoryToggle(subCategory.name)}
                                    >
                                        <p className="font-bold">{subCategory.name}</p>
                                        {openSubCategory === subCategory.name ? (
                                            <FiChevronUp size={16} />
                                        ) : (
                                            <FiChevronDown size={16} />
                                        )}
                                    </div>

                                    {/* Nested sub-subcategories with checkboxes */}
                                    {openSubCategory === subCategory.name && (
                                        <div className="pl-4 mt-2">
                                            {subCategory.subSubcategories.map((subSub) => (
                                                <div key={subSub.name} className="flex items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id={subSub.name}
                                                        className="mr-2"
                                                        checked={activeTags.includes(subSub.name)} // Checkbox checked state
                                                        onChange={() => handleTagChange(subSub.name)} // Handle Change
                                                    />
                                                    <label htmlFor={subSub.name} className="text-sm">
                                                        {subSub.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
