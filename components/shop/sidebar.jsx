import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import Next.js router
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import useStore from "../../store/store";

import urlFor from "@/functions/urlFor";

// FUNCTIONS
import updateActiveTags from "../../functions/updateActiveTags";

export default function Sidebar({ categories }) {
    console.log("CATS", categories);
    const router = useRouter(); // Access Next.js router
    const [openCategory, setOpenCategory] = useState("Textilveredelung");
    const [openSubCategory, setOpenSubCategory] = useState("Streetwear");

    const { activeCategory, setActiveCategory, activeTags, addTag, removeTag, setActiveTags } = useStore();

    const handleTagChange = (subSubCat, parentSubCat) => {
        const currentSubCategoryTags =
            categories
                .find((cat) => cat.subcategories?.some((sub) => sub.name === parentSubCat))
                ?.subcategories?.find((sub) => sub.name === parentSubCat)
                ?.subSubcategories?.map((subSub) => subSub.name) || [];

        let updatedTags;

        if (activeTags.includes(subSubCat)) {
            // Remove the tag if it's already active
            updatedTags = activeTags.filter((tag) => tag !== subSubCat);
        } else {
            // Add the tag and preserve others, including tags from unrelated subcategories
            updatedTags = [...activeTags, subSubCat];
        }

        setActiveTags(updatedTags);

        // Prepare the concatenated query for tags
        const concatenatedSubCats = updatedTags.filter((tag) => currentSubCategoryTags.includes(tag)).join("+");

        // Update the URL query for the active subcategory and tags
        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
                cat: parentSubCat,
                subCat: concatenatedSubCats,
            },
        });
    };

    useEffect(() => {
        updateActiveTags(categories, activeCategory, setActiveTags);
    }, [activeCategory, setActiveTags]);

    const handleCategoryToggle = (category) => {
        setOpenCategory((prev) => (prev === category ? null : category));
    };

    const handleSubCategoryToggle = (subCategory) => {
        setOpenSubCategory((prev) => (prev === subCategory ? null : subCategory));
    };

    useEffect(() => {
        return () => {
            setActiveTags([]);
        };
    }, [setActiveTags]);

    // Animation variants for smooth collapsing
    const collapseVariants = {
        hidden: { height: 0, opacity: 0, overflow: "hidden" },
        visible: { height: "auto", opacity: 1, overflow: "hidden" },
    };

    return (
        <div className="bg-white rounded-2xl hidden lg:block lg:my-12 p-8 shadow-md w-full col-span-12 lg:col-span-3 max-w-xs !font-body">
            <div className="sticky top-[150px]">
                <button
                    className={`w-full  mb-4 p-2 font-bold rounded-[10px] text-center ${
                        router.query.cat === "all" ? "bg-primaryColor text-white" : "bg-gray-200 text-black"
                    }`}
                    onClick={() => {
                        router.push({
                            pathname: router.pathname,
                            query: { cat: "all" },
                        });
                        setActiveTags([]);
                    }}
                >
                    ALLE PRODUKTE
                </button>
                {categories.map((category) => (
                    <div key={category.name} className="mb-4">
                        {/* Category Title */}
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => handleCategoryToggle(category.name)}
                        >
                            <h4 className="text-base font-regular uppercase font-semibold tracking-wider">
                                {category.name}
                            </h4>
                            {openCategory === category.name ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                        </div>
                        <hr className="border border-black bg-black text-black opacity-10 my-2 " />

                        {/* Subcategories with animation */}
                        <AnimatePresence>
                            {openCategory === category.name && (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={collapseVariants}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="pl-4 mt-2"
                                >
                                    {category.subcategories.map((subCategory) => {
                                        // Check if subSubcategories exist
                                        const subSubcategoriesExist =
                                            Array.isArray(subCategory.subSubcategories) &&
                                            subCategory.subSubcategories.length > 0;

                                        return (
                                            <div key={subCategory.name}>
                                                {/* Subcategory Header */}
                                                <div
                                                    className={`flex items-center space-x-4 cursor-pointer mb-2 ${
                                                        subSubcategoriesExist ? "cursor-pointer" : ""
                                                    }`}
                                                    onClick={() => {
                                                        if (subSubcategoriesExist) {
                                                            handleSubCategoryToggle(subCategory.name);
                                                        }
                                                    }}
                                                >
                                                    <img src={urlFor(subCategory.icon)} className="w-6" alt="" />
                                                    <p className="font-semibold">{subCategory.name}</p>
                                                    {subSubcategoriesExist ? (
                                                        openSubCategory === subCategory.name ? (
                                                            <FiChevronUp size={16} />
                                                        ) : (
                                                            <FiChevronDown size={16} />
                                                        )
                                                    ) : (
                                                        // Render checkbox if no subSubcategories
                                                        <input
                                                            type="checkbox"
                                                            id={subCategory.name}
                                                            className="ml-2"
                                                            checked={activeTags.includes(subCategory.name)}
                                                            onChange={() =>
                                                                handleTagChange(subCategory.name, category.name)
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                {/* Render subSubcategories if they exist */}
                                                {subSubcategoriesExist && (
                                                    <AnimatePresence>
                                                        {openSubCategory === subCategory.name && (
                                                            <motion.div
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="hidden"
                                                                variants={collapseVariants}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="pl-4 mt-2 mb-2"
                                                            >
                                                                {subCategory.subSubcategories.map((subSub) => (
                                                                    <div
                                                                        key={subSub.name}
                                                                        className="flex items-center mb-2"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            id={subSub.name}
                                                                            className="mr-2"
                                                                            checked={activeTags.includes(subSub.name)}
                                                                            onChange={() =>
                                                                                handleTagChange(
                                                                                    subSub.name,
                                                                                    subCategory.name
                                                                                )
                                                                            }
                                                                        />
                                                                        <label
                                                                            htmlFor={subSub.name}
                                                                            className="text-sm"
                                                                        >
                                                                            {subSub.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
