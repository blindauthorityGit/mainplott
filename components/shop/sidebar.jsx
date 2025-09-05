import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import urlFor from "@/functions/urlFor";
import GeneralCheckBoxSmall from "@/components/inputs/generalCheckboxSmall";

export default function Sidebar({
    categories,
    selectedCats,
    selectedTags,
    onSelectCategory,
    onSelectTag,
    onResetFilters,
    allProducts,
}) {
    const [openCategories, setOpenCategories] = useState([]);
    const [openSubCategories, setOpenSubCategories] = useState([]);

    const isCatSelected = (slug) => selectedCats.includes(slug);
    const isTagSelected = (slug) => selectedTags.includes(slug);

    function countProductsForMainCat(mainCatValue, allProds) {
        const catTag = "category_" + mainCatValue.toLowerCase();
        return allProds.filter((p) => (p.node.tags || []).map((t) => t.toLowerCase()).includes(catTag)).length;
    }

    function countProductsForSubTag(mainCatValue, subTagValue, allProds) {
        const catTag = "category_" + mainCatValue.toLowerCase();
        const subTag = subTagValue.toLowerCase();
        return allProds.filter((p) => {
            const tagsLower = (p.node.tags || []).map((t) => t.toLowerCase());
            return tagsLower.includes(catTag) && tagsLower.includes(subTag);
        }).length;
    }

    useEffect(() => {
        const allCatNames = categories.map((c) => c.name);
        setOpenCategories(allCatNames);
        const allSubCatNames = [];
        categories.forEach((cat) => cat.subcategories.forEach((sub) => allSubCatNames.push(sub.name)));
        setOpenSubCategories(allSubCatNames);
    }, [categories]);

    return (
        <aside className="hidden lg:block col-span-12 lg:col-span-3 max-w-xs font-body">
            <div className="sticky top-[50px] xl:top-[84px] 2xl:top-[96px]">
                <div className="bg-white/85 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-6">
                    {/* Top controls */}
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            className={`flex-1 p-2 font-semibold rounded-[6px] text-sm text-center transition ${
                                isCatSelected("all")
                                    ? "bg-textColor text-white"
                                    : "bg-gray-200 text-textColor hover:bg-gray-300"
                            }`}
                            onClick={onResetFilters}
                        >
                            Alle Produkte
                        </button>

                        <button
                            onClick={onResetFilters}
                            className="text-xs px-2 py-1 rounded-md text-primaryColor hover:bg-primaryColor/10"
                            title="Filter zurücksetzen"
                        >
                            Zurücksetzen
                        </button>
                    </div>

                    {categories.map((topLevelCat) => (
                        <div key={topLevelCat.name} className="mb-3">
                            {/* Section header */}
                            <button
                                type="button"
                                className="w-full flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    setOpenCategories((prev) =>
                                        prev.includes(topLevelCat.name)
                                            ? prev.filter((c) => c !== topLevelCat.name)
                                            : [...prev, topLevelCat.name]
                                    )
                                }
                                aria-expanded={openCategories.includes(topLevelCat.name)}
                            >
                                <h4 className="text-sm 2xl:text-base">{topLevelCat.name}</h4>
                                {openCategories.includes(topLevelCat.name) ? (
                                    <FiChevronUp size={18} />
                                ) : (
                                    <FiChevronDown size={18} />
                                )}
                            </button>

                            <hr className="border-t border-gray-200 my-2" />

                            <AnimatePresence initial={false}>
                                {openCategories.includes(topLevelCat.name) && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        transition={{ duration: 0.18, ease: "easeInOut" }}
                                        className="pl-3 mt-1 overflow-hidden"
                                    >
                                        {topLevelCat.subcategories.map((subCategory) => {
                                            const hasSubSub =
                                                Array.isArray(subCategory.subSubcategories) &&
                                                subCategory.subSubcategories.length > 0;
                                            const mainCatSlug = subCategory.value;
                                            const displayName = subCategory.name;
                                            const checkedSubCat = isCatSelected(mainCatSlug);
                                            const mainCount = countProductsForMainCat(mainCatSlug, allProducts);

                                            return (
                                                <div
                                                    key={mainCatSlug}
                                                    className="mb-1 rounded-lg px-1 py-1 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {/* caret */}
                                                        <button
                                                            type="button"
                                                            className={`p-1 rounded-md transition ${
                                                                hasSubSub
                                                                    ? "hover:bg-gray-100"
                                                                    : "opacity-0 pointer-events-none"
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!hasSubSub) return;
                                                                setOpenSubCategories((prev) =>
                                                                    prev.includes(displayName)
                                                                        ? prev.filter((n) => n !== displayName)
                                                                        : [...prev, displayName]
                                                                );
                                                            }}
                                                            aria-label="Unterkategorie ein-/ausklappen"
                                                        >
                                                            {openSubCategories.includes(displayName) ? (
                                                                <FiChevronUp size={16} />
                                                            ) : (
                                                                <FiChevronDown size={16} />
                                                            )}
                                                        </button>

                                                        {/* icon */}
                                                        {subCategory.icon && (
                                                            <img
                                                                src={urlFor(subCategory.icon)}
                                                                className="w-5 h-5 object-contain opacity-80"
                                                                alt=""
                                                            />
                                                        )}

                                                        {/* label */}
                                                        <button
                                                            type="button"
                                                            className="flex-1 text-left font-medium text-xs 2xl:text-sm text-textColor"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (hasSubSub) {
                                                                    setOpenSubCategories((prev) =>
                                                                        prev.includes(displayName)
                                                                            ? prev.filter((n) => n !== displayName)
                                                                            : [...prev, displayName]
                                                                    );
                                                                } else {
                                                                    onSelectCategory(mainCatSlug);
                                                                }
                                                            }}
                                                            title={displayName}
                                                        >
                                                            {displayName}{" "}
                                                            <span className="text-textColor/60">({mainCount})</span>
                                                        </button>

                                                        <GeneralCheckBoxSmall
                                                            isChecked={checkedSubCat}
                                                            onToggle={() => onSelectCategory(mainCatSlug)}
                                                        />
                                                    </div>

                                                    {/* sub-sub */}
                                                    {hasSubSub && openSubCategories.includes(displayName) && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: "auto" }}
                                                            exit={{ height: 0 }}
                                                            transition={{ duration: 0.16, ease: "easeInOut" }}
                                                            className="pl-6 mt-2 mb-2 overflow-hidden"
                                                        >
                                                            {subCategory.subSubcategories.map((subSub) => {
                                                                const subSubSlug = subSub.value;
                                                                const subSubDisplay = subSub.name;
                                                                const tagCount = countProductsForSubTag(
                                                                    mainCatSlug,
                                                                    subSubSlug,
                                                                    allProducts
                                                                );
                                                                const isChecked = isTagSelected(subSubSlug);
                                                                const disabled = tagCount === 0;

                                                                return (
                                                                    <div
                                                                        key={subSubSlug}
                                                                        className="flex items-center mb-1.5 2xl:mb-2"
                                                                    >
                                                                        <GeneralCheckBoxSmall
                                                                            isChecked={isChecked}
                                                                            onToggle={() =>
                                                                                !disabled &&
                                                                                onSelectTag(mainCatSlug, subSubSlug)
                                                                            }
                                                                            disabled={disabled}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                !disabled &&
                                                                                onSelectTag(mainCatSlug, subSubSlug)
                                                                            }
                                                                            className={`text-xs 2xl:text-sm text-left ${
                                                                                disabled
                                                                                    ? "text-gray-300 cursor-not-allowed"
                                                                                    : "text-textColor hover:underline/10"
                                                                            }`}
                                                                        >
                                                                            {subSubDisplay}{" "}
                                                                            <span className="text-textColor/60">
                                                                                ({tagCount})
                                                                            </span>
                                                                        </button>
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
                    ))}
                </div>
            </div>
        </aside>
    );
}
