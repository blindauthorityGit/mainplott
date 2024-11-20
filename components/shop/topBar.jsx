import { useState } from "react";
import { useRouter } from "next/router";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/store";

export default function TopBar({ categories }) {
    const router = useRouter();
    const [openCategory, setOpenCategory] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { activeTags, setActiveTags } = useStore();

    const handleTagChange = (subSubCat, parentSubCat) => {
        const selectedCategoryTags = categories
            .find((cat) => cat.subcategories.some((sub) => sub.name === parentSubCat))
            .subcategories.find((sub) => sub.name === parentSubCat)
            .subSubcategories.map((subSub) => subSub.name);

        const updatedTags = activeTags.includes(subSubCat)
            ? activeTags.filter((tag) => tag !== subSubCat)
            : [...activeTags.filter((tag) => selectedCategoryTags.includes(tag)), subSubCat];

        setActiveTags(updatedTags);
        const concatenatedTags = updatedTags.join("+");

        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
                cat: parentSubCat,
                subCat: concatenatedTags,
            },
        });
    };

    const handleCategoryToggle = (category) => {
        setOpenCategory((prev) => (prev === category ? null : category));
    };

    const collapseVariants = {
        hidden: { height: 0, opacity: 0, overflow: "hidden" },
        visible: { height: "auto", opacity: 1, overflow: "hidden" },
    };

    return (
        <div className="bg-white shadow-md sticky lg:hidden top-0 z-50 col-span-12">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={() => {
                        router.push({ pathname: router.pathname, query: { cat: "all" } });
                        setActiveTags([]);
                    }}
                    className="text-sm font-bold uppercase text-primaryColor"
                >
                    Alle Produkte
                </button>
                <button
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="flex items-center space-x-2 text-sm font-bold text-gray-700"
                >
                    <FiFilter className="text-lg" />
                    <span>Filter</span>
                </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50 p-4"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {categories.map((category) => (
                            <div key={category.name} className="mb-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => handleCategoryToggle(category.name)}
                                >
                                    <h4 className="text-base font-semibold">{category.name}</h4>
                                    {openCategory === category.name ? (
                                        <FiChevronUp size={20} />
                                    ) : (
                                        <FiChevronDown size={20} />
                                    )}
                                </div>
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
                                                <div key={subCategory.name} className="mb-2">
                                                    <p className="font-medium">{subCategory.name}</p>
                                                    <div className="pl-4 mt-1 space-y-2">
                                                        {subCategory.subSubcategories.map((subSub) => (
                                                            <div
                                                                key={subSub.name}
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    id={subSub.name}
                                                                    checked={activeTags.includes(subSub.name)}
                                                                    onChange={() =>
                                                                        handleTagChange(subSub.name, subCategory.name)
                                                                    }
                                                                />
                                                                <label htmlFor={subSub.name} className="text-sm">
                                                                    {subSub.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
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
    );
}
