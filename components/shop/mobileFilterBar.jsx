// components/MobileFilterBar.jsx
import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiFilter, FiXCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import urlFor from "@/functions/urlFor";

export default function MobileFilterBar({
    categories,
    selectedCats,
    selectedTags,
    onSelectCategory,
    onSelectTag,
    onResetFilters,
    allProducts,
}) {
    const [openCategory, setOpenCategory] = useState(null);
    const [openSubCategory, setOpenSubCategory] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);

    const isCatSelected = (slug) => selectedCats.includes(slug);

    // ---- Tag-Häkchen-Logik (wie in Sidebar, inkl. „polo“-Sonderfall)
    const isTagSelected = (main, slug) => {
        const tagSelected = (selectedTags || []).some((it) => {
            if (typeof it === "string") {
                if (it.includes(":")) {
                    const [m, s] = it.split(":");
                    return m === main && s === slug;
                }
                return it === slug; // legacy: nur "polo"
            }
            if (it && typeof it === "object") {
                const m = it.main ?? it.cat ?? it.category;
                const s = it.sub ?? it.tag ?? it.slug ?? it.value;
                if (m && s) return m === main && s === slug;
                return s === slug;
            }
            return false;
        });

        // „polo“ Hard-Fix gegen doppelte Aktivierung bei zwei aktiven Hauptkategorien
        if (slug === "polo") {
            if (main === "streetwear" && selectedCats.includes("workwear")) {
                return tagSelected && selectedCats.includes("streetwear") && !selectedCats.includes("workwear");
            }
            if (main === "workwear" && selectedCats.includes("streetwear")) {
                return tagSelected && selectedCats.includes("workwear") && !selectedCats.includes("streetwear");
            }
        }

        return tagSelected && selectedCats.includes(main);
    };

    // Counts analog zur Desktop-Sidebar
    const countProductsForCollection = (collectionHandle) => {
        const lower = String(collectionHandle || "").toLowerCase();
        return allProducts.filter((p) => {
            const handles = p.node.collections.edges.map((e) => e.node.handle.toLowerCase());
            return handles.includes(lower);
        }).length;
    };

    const countProductsForSubTag = (mainCat, subTag) => {
        const catTag = "category_" + String(mainCat || "").toLowerCase();
        const sub = String(subTag || "").toLowerCase();
        return allProducts.filter((p) => {
            const tagsLower = (p.node.tags || []).map((t) => t.toLowerCase());
            return tagsLower.includes(catTag) && tagsLower.includes(sub);
        }).length;
    };

    const toggleFilter = () => {
        setFilterOpen((prev) => !prev);
        if (filterOpen) {
            setOpenCategory(null);
            setOpenSubCategory(null);
        }
    };
    const toggleCategory = (name) => {
        setOpenSubCategory(null);
        setOpenCategory((prev) => (prev === name ? null : name));
    };
    const toggleSubCategory = (name) => {
        setOpenSubCategory((prev) => (prev === name ? null : name));
    };

    const handleAllProductsClick = () => {
        onResetFilters();
        setFilterOpen(false);
    };
    const handleApplyFilters = () => {
        setFilterOpen(false);
    };

    return (
        <div className="w-full lg:hidden font-body sticky top-0 z-30">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
                <h3 className="text-base font-semibold text-textColor">Produkte</h3>
                <div className="flex items-center space-x-3">
                    <button
                        className="flex items-center space-x-1 text-primaryColor font-medium"
                        onClick={toggleFilter}
                    >
                        <FiFilter />
                        <span>Filter</span>
                    </button>
                    <button
                        onClick={handleAllProductsClick}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                        title="Alle Filter löschen"
                    >
                        <FiXCircle size={20} />
                    </button>
                </div>
            </div>

            {/* Filter panel */}
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
                        {/* Reset inside panel */}
                        <div className="p-4 border-b border-gray-200">
                            <button
                                className="w-full py-2 text-center rounded-md font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                onClick={handleAllProductsClick}
                            >
                                Alle Produkte
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="max-h-[60vh] overflow-y-auto text-textColor px-4 pb-4">
                            {categories.map((cat) => (
                                <div key={cat.name} className="mt-3 border-b border-gray-100 pb-2">
                                    {/* Header */}
                                    <div
                                        className="flex items-center justify-between cursor-pointer py-2"
                                        onClick={() => toggleCategory(cat.name)}
                                    >
                                        <h4 className="text-sm font-medium">{cat.name}</h4>
                                        {openCategory === cat.name ? (
                                            <FiChevronUp size={16} />
                                        ) : (
                                            <FiChevronDown size={16} />
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {openCategory === cat.name && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="pl-2 mt-2"
                                            >
                                                {cat.subcategories.map((subCat) => {
                                                    const { name, value, subSubcategories, icon } = subCat;
                                                    const hasSubSub =
                                                        Array.isArray(subSubcategories) && subSubcategories.length > 0;
                                                    const isChecked = isCatSelected(value);
                                                    const count = countProductsForCollection(value);

                                                    return (
                                                        <div key={value} className="mb-2">
                                                            {/* SubCategory */}
                                                            <div className="flex items-center justify-between py-1">
                                                                <div
                                                                    className="flex items-center space-x-2 cursor-pointer"
                                                                    onClick={() => onSelectCategory(value)}
                                                                >
                                                                    {icon && (
                                                                        <img
                                                                            src={urlFor(icon)}
                                                                            className="w-4 h-4"
                                                                            alt=""
                                                                        />
                                                                    )}
                                                                    <p className="text-xs font-medium">
                                                                        {name} ({count})
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="cursor-pointer"
                                                                        checked={isChecked}
                                                                        onChange={() => onSelectCategory(value)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    {hasSubSub && (
                                                                        <span
                                                                            className="cursor-pointer"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleSubCategory(name);
                                                                            }}
                                                                        >
                                                                            {openSubCategory === name ? (
                                                                                <FiChevronUp size={14} />
                                                                            ) : (
                                                                                <FiChevronDown size={14} />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Sub-Subcategories */}
                                                            {hasSubSub && openSubCategory === name && (
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
                                                                        {subSubcategories.map((ss) => {
                                                                            const tagCount = countProductsForSubTag(
                                                                                value,
                                                                                ss.value
                                                                            );
                                                                            const tagChecked = isTagSelected(
                                                                                value,
                                                                                ss.value
                                                                            );
                                                                            const disabled = tagCount === 0;

                                                                            return (
                                                                                <div
                                                                                    key={ss.value}
                                                                                    className={`flex items-center mb-1 text-xs ${
                                                                                        disabled
                                                                                            ? "opacity-40 cursor-not-allowed"
                                                                                            : "cursor-pointer"
                                                                                    }`}
                                                                                    onClick={() =>
                                                                                        !disabled &&
                                                                                        onSelectTag(value, ss.value)
                                                                                    }
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="mr-2 cursor-pointer"
                                                                                        checked={tagChecked}
                                                                                        onChange={() =>
                                                                                            !disabled &&
                                                                                            onSelectTag(value, ss.value)
                                                                                        }
                                                                                        onClick={(e) =>
                                                                                            e.stopPropagation()
                                                                                        }
                                                                                        disabled={disabled}
                                                                                    />
                                                                                    <label>
                                                                                        {ss.name} ({tagCount})
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

                        {/* Apply & final Reset */}
                        <div className="px-4 pt-4 space-y-3 pb-6">
                            <button
                                onClick={handleApplyFilters}
                                className="w-full py-2 text-center rounded-md font-semibold text-sm bg-primaryColor text-white hover:bg-primaryColor-700 transition-colors"
                            >
                                FILTER ANWENDEN
                            </button>
                            <button
                                onClick={handleAllProductsClick}
                                className="w-full py-2 text-center rounded-md font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                            >
                                <FiXCircle />
                                <span>Alle Filter löschen</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
