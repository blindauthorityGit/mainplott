import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import urlFor from "@/functions/urlFor";

export default function Sidebar({
    categories,
    selectedCats,
    selectedTags,
    onSelectCategory,
    onSelectTag,
    onResetFilters,
    allProducts,
}) {
    // Initially expand all categories and all subcategories
    const [openCategories, setOpenCategories] = useState([]);
    const [openSubCategories, setOpenSubCategories] = useState([]);

    useEffect(() => {
        // On mount, open all categories and sub-subcategories
        const allCatNames = categories.map((c) => c.name);
        setOpenCategories(allCatNames);

        // Also open all subcategories by default
        let allSubCatNames = [];
        categories.forEach((cat) => {
            cat.subcategories.forEach((sub) => {
                allSubCatNames.push(sub.name);
            });
        });
        setOpenSubCategories(allSubCatNames);
    }, [categories]);

    const isCatSelected = (catName) => selectedCats.includes(catName);
    const isTagSelected = (tagName) => selectedTags.includes(tagName);

    // Count functions
    const countProductsForCollection = (collectionName) => {
        const colLower = collectionName.toLowerCase();
        return allProducts.filter((p) => {
            const productCols = p.node.collections.edges.map((e) => e.node.handle.toLowerCase());
            return productCols.includes(colLower);
        }).length;
    };

    const countProductsForTag = (tagName) => {
        const tagLower = tagName.toLowerCase();
        return allProducts.filter((p) => p.node.tags.map((t) => t.toLowerCase()).includes(tagLower)).length;
    };

    return (
        <div className="bg-white rounded-2xl hidden lg:block  p-8  w-full col-span-12 lg:col-span-3 max-w-xs font-body">
            <div className="sticky top-[50px] 2xl:top-[150px]">
                <button
                    className={`w-full mb-4 p-2 font-bold rounded-[6px] text-center ${
                        isCatSelected("all") ? "bg-primaryColor text-white" : "bg-gray-200 text-black"
                    }`}
                    onClick={onResetFilters}
                >
                    ALLE PRODUKTE
                </button>

                {categories.map((category) => (
                    <div key={category.name} className="mb-4">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            // Toggling is optional now since we want them all open, but we'll keep logic
                            onClick={() =>
                                setOpenCategories((prev) =>
                                    prev.includes(category.name)
                                        ? prev.filter((c) => c !== category.name)
                                        : [...prev, category.name]
                                )
                            }
                        >
                            <h4 className="text-base font-regular ">{category.name}</h4>
                            {openCategories.includes(category.name) ? (
                                <FiChevronUp size={20} />
                            ) : (
                                <FiChevronDown size={20} />
                            )}
                        </div>
                        <hr className="border border-black bg-black text-black opacity-10 my-1 " />

                        <AnimatePresence>
                            {openCategories.includes(category.name) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="pl-4 mt-2"
                                >
                                    {category.subcategories.map((subCategory) => {
                                        const hasSubSub =
                                            Array.isArray(subCategory.subSubcategories) &&
                                            subCategory.subSubcategories.length > 0;
                                        const subCatName = subCategory.name;
                                        const checkedSubCat =
                                            isCatSelected(subCatName) ||
                                            (hasSubSub &&
                                                subCategory.subSubcategories.some((ssc) => isTagSelected(ssc.name)));

                                        // Count products
                                        let count = 0;
                                        if (hasSubSub) {
                                            // subCategory is a collection
                                            count = countProductsForCollection(subCatName);
                                        } else {
                                            // subCategory is a tag
                                            count = countProductsForTag(subCatName);
                                        }

                                        return (
                                            <div key={subCatName}>
                                                <div
                                                    className="flex items-center space-x-4 cursor-pointer mb-2"
                                                    onClick={() => {
                                                        if (!hasSubSub) {
                                                            // No subSub, treat as tag
                                                            onSelectTag(subCatName, subCatName);
                                                        } else {
                                                            // Collection - just toggle open
                                                            setOpenSubCategories((prev) =>
                                                                prev.includes(subCatName)
                                                                    ? prev.filter((c) => c !== subCatName)
                                                                    : [...prev, subCatName]
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {subCategory.icon && (
                                                        <img src={urlFor(subCategory.icon)} className="w-6" alt="" />
                                                    )}
                                                    <p className="font-semibold text-sm">
                                                        {subCatName} ({count})
                                                    </p>
                                                    {hasSubSub ? (
                                                        openSubCategories.includes(subCatName) ? (
                                                            <FiChevronUp size={16} />
                                                        ) : (
                                                            <FiChevronDown size={16} />
                                                        )
                                                    ) : (
                                                        <input
                                                            type="checkbox"
                                                            className="ml-2"
                                                            checked={checkedSubCat}
                                                            onChange={() => onSelectTag(subCatName, subCatName)}
                                                        />
                                                    )}
                                                </div>

                                                {hasSubSub && openSubCategories.includes(subCatName) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="pl-4 mt-2 mb-2"
                                                    >
                                                        {subCategory.subSubcategories.map((subSub) => {
                                                            const tagCount = countProductsForTag(subSub.name);
                                                            return (
                                                                <div
                                                                    key={subSub.name}
                                                                    className="flex items-center mb-1 2xl:mb-2"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mr-2"
                                                                        checked={isTagSelected(subSub.name)}
                                                                        onChange={() =>
                                                                            onSelectTag(subCatName, subSub.name)
                                                                        }
                                                                    />
                                                                    <label className="text-sm">
                                                                        {subSub.name} ({tagCount})
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
                ))}
            </div>
        </div>
    );
}
