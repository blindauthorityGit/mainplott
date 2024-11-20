import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/store";
import urlFor from "@/functions/urlFor";

export default function TopBar({ categories, products }) {
    const router = useRouter();
    const [openCategory, setOpenCategory] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { activeTags, setActiveTags } = useStore();
    const [categoryCounts, setCategoryCounts] = useState({});
    const filterRef = useRef(null);

    useEffect(() => {
        const counts = {};

        categories.forEach((category) => {
            const subCategoryCounts = {};

            category.subcategories.forEach((subCategory) => {
                const subSubCategoryCounts = {};

                subCategory.subSubcategories.forEach((subSub) => {
                    subSubCategoryCounts[subSub.name] = products.filter((product) =>
                        product.node.tags.includes(subSub.name)
                    ).length;
                });

                subCategoryCounts[subCategory.name] = Object.values(subSubCategoryCounts).reduce(
                    (sum, count) => sum + count,
                    0
                );
            });

            counts[category.name] = Object.values(subCategoryCounts).reduce((sum, count) => sum + count, 0);
        });

        setCategoryCounts(counts);
    }, [categories, products]);

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
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1 },
    };

    const textVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delay: 0.2 } }, // Delays text appearance
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white shadow-md sticky lg:hidden top-0 z-50 col-span-12 font-body" ref={filterRef}>
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
                                    <h4 className="text-base font-semibold">
                                        {category.name} ({categoryCounts[category.name] || 0})
                                    </h4>
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
                                                <motion.div
                                                    key={subCategory.name}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    variants={textVariants}
                                                    className="mb-2"
                                                >
                                                    <div className="flex space-x-2 mb-2">
                                                        <img src={urlFor(subCategory.icon)} className="w-6" alt="" />
                                                        <p className="font-semibold">
                                                            {subCategory.name} ({categoryCounts[subCategory.name] || 0})
                                                        </p>
                                                    </div>
                                                    <div className="pl-4 mt-1 space-y-2">
                                                        {subCategory.subSubcategories.map((subSub) => (
                                                            <motion.div
                                                                key={subSub.name}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="hidden"
                                                                variants={textVariants}
                                                                className="flex items-center mb-2 space-x-2"
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
                                                                    {subSub.name} (
                                                                    {products.filter((product) =>
                                                                        product.node.tags.includes(subSub.name)
                                                                    ).length || 0}
                                                                    )
                                                                </label>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
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
