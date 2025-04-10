import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import urlFor from "@/functions/urlFor";

/**
 * MobileFilterBar
 */
export default function MobileFilterBar({
    categories,
    selectedCats,
    selectedTags,
    onSelectTag,
    onResetFilters,
    allProducts,
}) {
    // Track which main category is open
    const [openCategory, setOpenCategory] = useState(null);
    // Track which sub-category is open
    const [openSubCategory, setOpenSubCategory] = useState(null);

    // Whether the entire filter menu is open
    const [filterOpen, setFilterOpen] = useState(false);

    // Helpers to check selection
    const isCatSelected = (catName) => selectedCats.includes(catName);
    const isTagSelected = (tagName) => selectedTags.includes(tagName);

    // Count how many products are in a collection
    const countProductsForCollection = (collectionName) => {
        const colLower = collectionName.toLowerCase();
        return allProducts.filter((p) => {
            const productCols = p.node.collections.edges.map((e) => e.node.handle.toLowerCase());
            return productCols.includes(colLower);
        }).length;
    };

    // Count how many products match a tag
    const countProductsForTag = (tagName) => {
        const tagLower = tagName.toLowerCase();
        return allProducts.filter((p) => p.node.tags.map((t) => t.toLowerCase()).includes(tagLower)).length;
    };

    // Expand/collapse the main filter panel
    const toggleFilter = () => {
        setFilterOpen((prev) => !prev);
        // if closing, reset open states
        if (filterOpen) {
            setOpenCategory(null);
            setOpenSubCategory(null);
        }
    };

    // Expand/collapse a main category
    const toggleCategory = (catName) => {
        setOpenSubCategory(null);
        setOpenCategory((prev) => (prev === catName ? null : catName));
    };

    // Expand/collapse a subcategory
    const toggleSubCategory = (subCatName) => {
        setOpenSubCategory((prev) => (prev === subCatName ? null : subCatName));
    };

    // Handle “Alle Produkte” => reset & close
    const handleAllProductsClick = () => {
        onResetFilters();
        setFilterOpen(false);
    };

    // “Filter Anwenden” => close gracefully
    const handleApplyFilters = () => {
        setFilterOpen(false);
    };

    return (
        <div className="w-full lg:hidden font-body sticky top-0 z-30">
            {/* Top bar with "Filter" button */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
                <h3 className="text-base font-semibold text-textColor">Produkte</h3>
                <button className="flex items-center space-x-1 text-primaryColor font-medium" onClick={toggleFilter}>
                    <FiFilter />
                    <span>Filter</span>
                </button>
            </div>

            {/* Expanded filter panel */}
            <AnimatePresence>
                {filterOpen && (
                    <motion.div
                        key="filter-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200"
                    >
                        {/* Reset Filters Button */}
                        <div className="p-4 border-b border-gray-200">
                            <button
                                className="w-full py-2 text-center rounded-md font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                onClick={handleAllProductsClick}
                            >
                                Alle Produkte
                            </button>
                        </div>

                        {/* Category List */}
                        <div className="max-h-[60vh] overflow-y-auto text-textColor px-4 pb-4">
                            {categories.map((category) => (
                                <div key={category.name} className="mt-3 border-b border-gray-100 pb-2">
                                    {/* Main Category Header */}
                                    <div
                                        className="flex items-center justify-between cursor-pointer py-2"
                                        onClick={() => toggleCategory(category.name)}
                                    >
                                        <h4 className="text-sm font-medium">{category.name}</h4>
                                        {openCategory === category.name ? (
                                            <FiChevronUp size={16} />
                                        ) : (
                                            <FiChevronDown size={16} />
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {openCategory === category.name && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="pl-2 mt-2"
                                            >
                                                {category.subcategories.map((subCategory) => {
                                                    const hasSubSub =
                                                        Array.isArray(subCategory.subSubcategories) &&
                                                        subCategory.subSubcategories.length > 0;
                                                    const subCatName = subCategory.name;
                                                    const subCatOpen = openSubCategory === subCatName;
                                                    // Use the subCat's name for selection state
                                                    const isCheckedSub = isCatSelected(subCatName);
                                                    const totalCount = hasSubSub
                                                        ? countProductsForCollection(subCatName)
                                                        : countProductsForTag(subCatName);

                                                    return (
                                                        <div key={subCatName} className="mb-2">
                                                            {/* SubCategory Row */}
                                                            <div className="flex items-center justify-between py-1">
                                                                <div
                                                                    className="flex items-center space-x-2 cursor-pointer"
                                                                    onClick={() => {
                                                                        // Clicking the label toggles the checkbox for sub-category
                                                                        onSelectTag(subCatName, subCatName);
                                                                    }}
                                                                >
                                                                    {subCategory.icon && (
                                                                        <img
                                                                            src={urlFor(subCategory.icon)}
                                                                            className="w-4 h-4"
                                                                            alt=""
                                                                        />
                                                                    )}
                                                                    <p className="text-xs font-medium cursor-pointer">
                                                                        {subCatName} ({totalCount})
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="cursor-pointer"
                                                                        checked={isCheckedSub}
                                                                        onChange={() =>
                                                                            onSelectTag(subCatName, subCatName)
                                                                        }
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    {hasSubSub && (
                                                                        <span
                                                                            className="cursor-pointer"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleSubCategory(subCatName);
                                                                            }}
                                                                        >
                                                                            {subCatOpen ? (
                                                                                <FiChevronUp size={14} />
                                                                            ) : (
                                                                                <FiChevronDown size={14} />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Sub-Subcategories */}
                                                            {hasSubSub && subCatOpen && (
                                                                <AnimatePresence>
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{
                                                                            duration: 0.3,
                                                                            ease: "easeInOut",
                                                                        }}
                                                                        className="pl-4 mt-1"
                                                                    >
                                                                        {subCategory.subSubcategories.map((subSub) => {
                                                                            const tagCount = countProductsForTag(
                                                                                subSub.name,
                                                                                allProducts
                                                                            );
                                                                            return (
                                                                                <div
                                                                                    key={subSub.name}
                                                                                    className="flex items-center mb-1 text-xs cursor-pointer"
                                                                                    onClick={() =>
                                                                                        onSelectTag(
                                                                                            subCatName,
                                                                                            subSub.name
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="mr-2 cursor-pointer"
                                                                                        checked={isTagSelected(
                                                                                            subSub.name
                                                                                        )}
                                                                                        onChange={() =>
                                                                                            onSelectTag(
                                                                                                subCatName,
                                                                                                subSub.name
                                                                                            )
                                                                                        }
                                                                                        onClick={(e) =>
                                                                                            e.stopPropagation()
                                                                                        }
                                                                                    />
                                                                                    <label className="cursor-pointer">
                                                                                        {subSub.name} ({tagCount})
                                                                                    </label>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </motion.div>
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

                        {/* "FILTER ANWENDEN" Button at Bottom */}
                        <div className="pt-4 mb-4 p-4">
                            <button
                                onClick={handleApplyFilters}
                                className="w-full py-2 text-center rounded-md font-semibold text-sm bg-primaryColor text-white hover:bg-primaryColor-700 transition-colors"
                            >
                                FILTER ANWENDEN
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
