import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import urlFor from "@/functions/urlFor";

export default function Sidebar({
    categories, // e.g. [ { name: "Textilveredelung", subcategories: [ { name: "Streetwear", value: "streetwear", subSubcategories: [...] }, ... ] }, ... ]
    selectedCats, // array of main-cat slugs currently selected (e.g. ["streetwear"])
    selectedTags, // array of sub-tag slugs currently selected (e.g. ["t-shirt"])
    onSelectCategory, // function handleSelectCategory(catSlug)
    onSelectTag, // function handleSelectTag(mainCatSlug, subTagSlug)
    onResetFilters,
    allProducts, // the Shopify products array
}) {
    const [openCategories, setOpenCategories] = useState([]); // toggles top-level sections
    const [openSubCategories, setOpenSubCategories] = useState([]); // toggles sub-category expansions

    // Simple helpers to see if a mainCat or subTag is currently selected
    const isCatSelected = (slug) => selectedCats.includes(slug);
    const isTagSelected = (slug) => selectedTags.includes(slug);

    /**
     * Count how many products match “category_{mainCatValue}”
     */
    function countProductsForMainCat(mainCatValue, allProds) {
        const catTag = "category_" + mainCatValue.toLowerCase();
        return allProds.filter((p) => {
            const tagsLower = p.node.tags.map((t) => t.toLowerCase());
            return tagsLower.includes(catTag);
        }).length;
    }

    /**
     * Count how many products match “category_{mainCatValue}” AND “{subTagValue}”
     */
    function countProductsForSubTag(mainCatValue, subTagValue, allProds) {
        const catTag = "category_" + mainCatValue.toLowerCase();
        const subTag = subTagValue.toLowerCase();
        return allProds.filter((p) => {
            const tagsLower = p.node.tags.map((t) => t.toLowerCase());
            return tagsLower.includes(catTag) && tagsLower.includes(subTag);
        }).length;
    }

    /**
     * On mount, expand all categories & subcategories
     */
    useEffect(() => {
        const allCatNames = categories.map((c) => c.name);
        setOpenCategories(allCatNames);

        const allSubCatNames = [];
        categories.forEach((cat) => {
            cat.subcategories.forEach((sub) => {
                allSubCatNames.push(sub.name);
            });
        });
        setOpenSubCategories(allSubCatNames);
    }, [categories]);

    return (
        <div className="bg-white rounded-2xl hidden lg:block p-8 w-full col-span-12 lg:col-span-3 max-w-xs font-body">
            <div className="sticky top-[50px] 2xl:top-[150px]">
                <button
                    className={`w-full mb-4 p-2 font-bold rounded-[6px] text-center ${
                        isCatSelected("all") ? "bg-primaryColor text-white" : "bg-gray-200 text-textColor"
                    }`}
                    onClick={onResetFilters}
                >
                    ALLE PRODUKTE
                </button>

                {categories.map((topLevelCat) => {
                    return (
                        <div key={topLevelCat.name} className="mb-4">
                            {/* Toggle open/close for the entire top-level group */}
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    setOpenCategories((prev) =>
                                        prev.includes(topLevelCat.name)
                                            ? prev.filter((c) => c !== topLevelCat.name)
                                            : [...prev, topLevelCat.name]
                                    )
                                }
                            >
                                <h4 className="text-base font-regular">{topLevelCat.name}</h4>
                                {openCategories.includes(topLevelCat.name) ? (
                                    <FiChevronUp size={20} />
                                ) : (
                                    <FiChevronDown size={20} />
                                )}
                            </div>
                            <hr className="border border-black bg-black text-textColor opacity-10 my-1" />

                            <AnimatePresence>
                                {openCategories.includes(topLevelCat.name) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="pl-4 mt-2"
                                    >
                                        {topLevelCat.subcategories.map((subCategory) => {
                                            const hasSubSub =
                                                Array.isArray(subCategory.subSubcategories) &&
                                                subCategory.subSubcategories.length > 0;

                                            const mainCatSlug = subCategory.value; // e.g. "streetwear"
                                            const displayName = subCategory.name; // e.g. "Streetwear"

                                            const checkedSubCat = isCatSelected(mainCatSlug);
                                            const mainCount = countProductsForMainCat(mainCatSlug, allProducts);

                                            // We'll let the arrow toggle expansion, but the checkbox sets the filter
                                            return (
                                                <div key={mainCatSlug} className="mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        {/* Expand/collapse icon if subSub is present */}
                                                        {hasSubSub ? (
                                                            <div
                                                                className="cursor-pointer flex items-center"
                                                                onClick={(e) => {
                                                                    // only expand/collapse
                                                                    e.stopPropagation();
                                                                    setOpenSubCategories((prev) =>
                                                                        prev.includes(displayName)
                                                                            ? prev.filter((n) => n !== displayName)
                                                                            : [...prev, displayName]
                                                                    );
                                                                }}
                                                            >
                                                                {openSubCategories.includes(displayName) ? (
                                                                    <FiChevronUp size={16} />
                                                                ) : (
                                                                    <FiChevronDown size={16} />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            // If there's no subSub, show blank space or icon placeholder
                                                            <div style={{ width: "16px" }} />
                                                        )}

                                                        {/* Icon if any */}
                                                        {subCategory.icon && (
                                                            <img
                                                                src={urlFor(subCategory.icon)}
                                                                className="w-6"
                                                                alt={displayName}
                                                            />
                                                        )}

                                                        <p
                                                            className="font-semibold text-sm text-textColor cursor-pointer"
                                                            onClick={(e) => {
                                                                // also toggle expansion if hasSubSub
                                                                e.stopPropagation();
                                                                if (hasSubSub) {
                                                                    setOpenSubCategories((prev) =>
                                                                        prev.includes(displayName)
                                                                            ? prev.filter((n) => n !== displayName)
                                                                            : [...prev, displayName]
                                                                    );
                                                                } else {
                                                                    // If no subSub, we can directly toggle
                                                                    onSelectCategory(mainCatSlug);
                                                                }
                                                            }}
                                                        >
                                                            {displayName} ({mainCount})
                                                        </p>

                                                        {/* SubCategory checkbox for filtering the main cat */}
                                                        <input
                                                            type="checkbox"
                                                            className="cursor-pointer"
                                                            checked={checkedSubCat}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                onSelectCategory(mainCatSlug);
                                                            }}
                                                        />
                                                    </div>

                                                    {/* If subSubcategories exist and we are open, show them */}
                                                    {hasSubSub && openSubCategories.includes(displayName) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="pl-6 mt-2"
                                                        >
                                                            {subCategory.subSubcategories.map((subSub) => {
                                                                const subSubSlug = subSub.value; // e.g. "hoodie"
                                                                const subSubDisplay = subSub.name; // e.g. "Hoodie"
                                                                const tagCount = countProductsForSubTag(
                                                                    mainCatSlug,
                                                                    subSubSlug,
                                                                    allProducts
                                                                );
                                                                const isChecked = isTagSelected(subSubSlug);

                                                                return (
                                                                    <div
                                                                        key={subSubSlug}
                                                                        className="flex items-center mb-1 2xl:mb-2"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2 cursor-pointer"
                                                                            checked={isChecked}
                                                                            onChange={() =>
                                                                                onSelectTag(mainCatSlug, subSubSlug)
                                                                            }
                                                                        />
                                                                        <label className="text-sm text-textColor cursor-pointer">
                                                                            {subSubDisplay} ({tagCount})
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
