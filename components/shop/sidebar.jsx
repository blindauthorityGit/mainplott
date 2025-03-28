import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import urlFor from "@/functions/urlFor";

export default function Sidebar({
    categories, // e.g. [ { name: "Textilveredelung", subcategories: [ { name: "Streetwear", value: "streetwear", subSubcategories: [...] }, ... ] }, ... ]
    selectedCats, // array of "main cat" slugs currently selected
    selectedTags, // array of "sub-tag" slugs currently selected
    onSelectCategory, // function handleSelectCategory(catSlug)
    onSelectTag, // function handleSelectTag(mainCatSlug, subTagSlug)
    onResetFilters,
    allProducts, // the Shopify products array
}) {
    // We'll treat `category.subcategories[].value` as the “main cat” slug (e.g. "streetwear", "workwear")
    // and `subCategory.subSubcategories[].value` as the “sub-tag” (e.g. "hoodie", "t-shirt").

    const [openCategories, setOpenCategories] = useState([]);
    const [openSubCategories, setOpenSubCategories] = useState([]);

    /**
     * Count how many products have *just* this "main cat" (category_something)
     */
    function countProductsForMainCat(mainCatValue, allProds) {
        // For "streetwear", the relevant Shopify tag is "category_streetwear"
        const catTag = "category_" + mainCatValue.toLowerCase();
        return allProds.filter((p) => {
            const tagsLower = p.node.tags.map((t) => t.toLowerCase());
            return tagsLower.includes(catTag);
        }).length;
    }

    /**
     * Count how many products have *both* "category_mainCatValue" AND "subTagValue"
     * e.g. "category_streetwear" + "hoodie"
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

        let allSubCatNames = [];
        categories.forEach((cat) => {
            cat.subcategories.forEach((sub) => {
                allSubCatNames.push(sub.name);
            });
        });
        setOpenSubCategories(allSubCatNames);
    }, [categories]);

    // Helpers to see if a main cat or sub-tag is currently selected:
    const isCatSelected = (slug) => selectedCats.includes(slug);
    const isTagSelected = (slug) => selectedTags.includes(slug);

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
                    // e.g. topLevelCat.name = "Textilveredelung" or "Geschenkmanufaktur"
                    // It's mostly a "group label" in your UI
                    return (
                        <div key={topLevelCat.name} className="mb-4">
                            {/* Toggle open/close for the entire group */}
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
                                        {/* Now map the subcategories, each is a "main cat" for the product */}
                                        {topLevelCat.subcategories.map((subCategory) => {
                                            const hasSubSub =
                                                Array.isArray(subCategory.subSubcategories) &&
                                                subCategory.subSubcategories.length > 0;
                                            // The *slug* that identifies the main cat in your filter
                                            const mainCatSlug = subCategory.value; // e.g. "streetwear"
                                            const displayName = subCategory.name; // e.g. "Streetwear"

                                            // The user is considered "checked" if that main cat is in selectedCats
                                            const checkedSubCat = isCatSelected(mainCatSlug);

                                            // For counting:
                                            // if "hasSubSub", we show how many products match "category_streetwear".
                                            // if there's no subSub, treat it as "category_text" + subCatValue => or we do a subTag approach.
                                            // (You can adapt logic as needed.)
                                            let mainCount = 0;
                                            if (hasSubSub) {
                                                mainCount = countProductsForMainCat(mainCatSlug, allProducts);
                                            } else {
                                                // If you decide a subCategory with no subSub is just a single-level cat
                                                // then do the same:
                                                mainCount = countProductsForMainCat(mainCatSlug, allProducts);
                                                // Or if you intend it to be a sub-tag, do:
                                                // mainCount = countProductsForSubTag(parentSomething, subCategory.value, allProducts)
                                            }

                                            return (
                                                <div key={mainCatSlug}>
                                                    {/* The subCategory row */}
                                                    <div
                                                        className="flex items-center space-x-4 cursor-pointer mb-2"
                                                        onClick={() => {
                                                            if (hasSubSub) {
                                                                // Just toggle sub-sub open
                                                                setOpenSubCategories((prev) =>
                                                                    prev.includes(displayName)
                                                                        ? prev.filter((c) => c !== displayName)
                                                                        : [...prev, displayName]
                                                                );
                                                            } else {
                                                                // No subSub => treat as direct main cat (or direct subTag)
                                                                onSelectCategory(mainCatSlug);
                                                            }
                                                        }}
                                                    >
                                                        {subCategory.icon && (
                                                            <img
                                                                src={urlFor(subCategory.icon)}
                                                                className="w-6"
                                                                alt={displayName}
                                                            />
                                                        )}
                                                        <p className="font-semibold text-sm text-textColor">
                                                            {displayName} ({mainCount})
                                                        </p>

                                                        {/* If has subSub, show chevron up/down; otherwise show a checkbox */}
                                                        {hasSubSub ? (
                                                            openSubCategories.includes(displayName) ? (
                                                                <FiChevronUp size={16} />
                                                            ) : (
                                                                <FiChevronDown size={16} />
                                                            )
                                                        ) : (
                                                            // No subSub => show checkbox
                                                            <input
                                                                type="checkbox"
                                                                className="ml-2"
                                                                checked={checkedSubCat}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    onSelectCategory(mainCatSlug);
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Sub-sub list (e.g. "T-Shirt", "Hoodie", etc.) */}
                                                    {hasSubSub && openSubCategories.includes(displayName) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="pl-4 mt-2 mb-2"
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
                                                                        className="flex items-center mb-1 2xl:mb-2 text-textColor"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            checked={isChecked}
                                                                            onChange={() =>
                                                                                onSelectTag(mainCatSlug, subSubSlug)
                                                                            }
                                                                        />
                                                                        <label className="text-sm text-textColor">
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
