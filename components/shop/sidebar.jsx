import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import Next.js router
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import useStore from "../../store/store";

// FUNCTIONS
import updateActiveTags from "../../functions/updateActiveTags";

export default function Sidebar({ categories }) {
    const router = useRouter(); // Access Next.js router
    const [openCategory, setOpenCategory] = useState("Textilveredelung");
    const [openSubCategory, setOpenSubCategory] = useState("Streetwear");

    const { activeCategory, setActiveCategory, activeTags, addTag, removeTag, setActiveTags } = useStore();

    const handleTagChange = (subSubCat, parentSubCat) => {
        const currentSubCategoryTags = categories
            .find((cat) => cat.subcategories.some((sub) => sub.name === parentSubCat))
            .subcategories.find((sub) => sub.name === parentSubCat)
            .subSubcategories.map((subSub) => subSub.name);

        let updatedTags;
        if (activeTags.includes(subSubCat)) {
            updatedTags = activeTags.filter((tag) => tag !== subSubCat);
        } else {
            updatedTags = [...activeTags.filter((tag) => currentSubCategoryTags.includes(tag)), subSubCat];
        }

        setActiveTags(updatedTags);

        const concatenatedSubCats = updatedTags.join("+");
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
    }, [categories, activeCategory, setActiveTags]);

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
        <div className="bg-white rounded-2xl my-12 p-8 shadow-md w-full lg:col-span-3 max-w-xs !font-body">
            <div className="sticky top-[150px]">
                <button
                    className={`w-full text-left mb-4 p-2 font-bold ${
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
                    Show All Products
                </button>
                {categories.map((category) => (
                    <div key={category.name} className="mb-4">
                        {/* Category Title */}
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => handleCategoryToggle(category.name)}
                        >
                            <h4 className="text-lg font-bold">{category.name}</h4>
                            {openCategory === category.name ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                        </div>

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
                                    {category.subcategories.map((subCategory) => (
                                        <div key={subCategory.name}>
                                            <div
                                                className="flex items-center justify-between cursor-pointer mb-2"
                                                onClick={() => handleSubCategoryToggle(subCategory.name)}
                                            >
                                                <p className="font-bold">{subCategory.name}</p>
                                                {openSubCategory === subCategory.name ? (
                                                    <FiChevronUp size={16} />
                                                ) : (
                                                    <FiChevronDown size={16} />
                                                )}
                                            </div>

                                            {/* Sub-Subcategories with animation */}
                                            <AnimatePresence>
                                                {openSubCategory === subCategory.name && (
                                                    <motion.div
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="hidden"
                                                        variants={collapseVariants}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="pl-4 mt-2"
                                                    >
                                                        {subCategory.subSubcategories.map((subSub) => (
                                                            <div key={subSub.name} className="flex items-center mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={subSub.name}
                                                                    className="mr-2"
                                                                    checked={activeTags.includes(subSub.name)}
                                                                    onChange={() =>
                                                                        handleTagChange(subSub.name, subCategory.name)
                                                                    }
                                                                />
                                                                <label htmlFor={subSub.name} className="text-base">
                                                                    {subSub.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
