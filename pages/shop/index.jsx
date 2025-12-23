import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import client from "../../client";
import { MainContainer } from "../../layout/container";
import ProductListings from "../../components/shop/productListings";
import Sidebar from "../../components/shop/sidebar";
import MobileFilterBar from "../../components/shop/mobileFilterBar";
import TopBarFilter from "../../components/shop/topBarFilter";
import { getAllProducts, getAllCollectionsWithSubcollections } from "../../libs/shopify";
import buildShopPageSEO from "@/functions/buildShopPageSEO"; // adapt path
import MetaShopify from "@/components/SEO/shopify";
export default function Shop({ allProducts, globalData }) {
    const router = useRouter();
    const { cat, tags } = router.query;

    const initialCats = cat ? cat.split("+").filter(Boolean) : ["all"];
    const initialTags = tags ? tags.split("+").filter(Boolean) : [];

    const [selectedCats, setSelectedCats] = useState(initialCats);
    const [selectedTags, setSelectedTags] = useState(initialTags);
    const [sortOption, setSortOption] = useState("name"); // default sort by name
    const [searchTerm, setSearchTerm] = useState(""); // <<-- NEW

    // 1. Listen for changes in `cat` or `tags` from the URL, and resync the local states
    useEffect(() => {
        const newCats = cat ? cat.split("+").filter(Boolean) : ["all"];
        const newTags = tags ? tags.split("+").filter(Boolean) : [];

        setSelectedCats(newCats);
        setSelectedTags(newTags);
        // Now, when the query changes, your local states update,
        // causing the filtering logic to re-run below.
    }, [cat, tags]);

    const updateURL = (newCats, newTags) => {
        const query = {};
        if (newCats.length > 0) {
            query.cat = newCats.join("+");
        }
        if (newTags.length > 0) {
            query.tags = newTags.join("+");
        }
        router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    };

    const handleSelectCategory = (categoryName) => {
        let newCats = [...selectedCats];
        if (newCats.includes("all")) newCats = [];

        if (newCats.includes(categoryName)) {
            newCats = newCats.filter((c) => c !== categoryName);
        } else {
            newCats.push(categoryName);
        }

        if (newCats.length === 0) {
            newCats = ["all"];
        }

        setSelectedCats(newCats);
        updateURL(newCats, selectedTags);
    };

    // Example: getAllTagsForCategory('Workwear') => ['handwerk', 'baustelle']
    //          getAllTagsForCategory('Streetwear') => ['t-shirt', 'hoodie', 'sweater', 'jacken']
    function getAllTagsForCategory(mainCatValue, categoriesData) {
        // 1) Find the category object among all "top-level" categories
        //    that contains a subcategory with .value === mainCatValue
        for (const cat of categoriesData) {
            for (const sub of cat.subcategories) {
                if (sub.value === mainCatValue) {
                    // Found the matching subcategory (main-cat in your code)
                    // If it has subSubcategories, gather them:
                    if (Array.isArray(sub.subSubcategories) && sub.subSubcategories.length > 0) {
                        return sub.subSubcategories.map((ssc) => ssc.value.toLowerCase());
                    }
                    // Otherwise it’s a “direct” subcategory with no subSub, so the sub’s own .value is the “tag”
                    return [sub.value.toLowerCase()];
                }
            }
        }
        return [];
    }

    function handleSelectTag(mainCatValue, subTagValue) {
        let newCats = [...selectedCats];
        let newTags = [...selectedTags];

        // If "all" is present, remove it
        if (newCats.includes("all")) {
            newCats = [];
        }

        if (newTags.includes(subTagValue)) {
            // We are removing that tag from selectedTags
            newTags = newTags.filter((t) => t !== subTagValue);

            // Now check if there are ANY sub-tags from mainCatValue left in newTags
            if (newCats.includes(mainCatValue)) {
                const allTags = getAllTagsForCategory(mainCatValue, globalData.shop.categories);
                // intersection = which of allTags are still in newTags
                const intersection = allTags.filter((tag) => newTags.includes(tag));
                if (intersection.length === 0) {
                    // no sub-tags from this main cat remain => remove that main cat
                    newCats = newCats.filter((c) => c !== mainCatValue);
                }
            }
        } else {
            // We are adding that tag to selectedTags
            if (!newCats.includes(mainCatValue)) {
                newCats.push(mainCatValue);
            }
            newTags.push(subTagValue);
        }

        // If we ended up with no cats, reset to ["all"]
        if (newCats.length === 0) {
            newCats = ["all"];
        }

        setSelectedCats(newCats);
        setSelectedTags(newTags);
        updateURL(newCats, newTags);
    }

    const handleResetFilters = () => {
        setSelectedCats(["all"]);
        setSelectedTags([]);
        router.push({ pathname: router.pathname, query: { cat: "all" } }, undefined, { shallow: true });
    };

    const handleRemoveCat = (catName) => {
        let newCats = selectedCats.filter((c) => c !== catName);
        if (newCats.length === 0) newCats = ["all"];
        setSelectedCats(newCats);
        updateURL(newCats, selectedTags);
    };

    const handleRemoveTag = (tagName) => {
        const newTags = selectedTags.filter((t) => t !== tagName);
        setSelectedTags(newTags);
        updateURL(selectedCats, newTags);
    };

    // Put this near the top of your file (or inside the component):
    const EXCLUDED_FROM_ALL = ["hochzeit", "geburt", "weihnachten", "kinder", "geschenkidee"];

    // Then in your filter...
    const filteredProducts = allProducts.filter((product) => {
        const productCollections = product.node.collections.edges.map((e) => e.node.handle.toLowerCase());
        const productTags = product.node.tags.map((t) => t.toLowerCase());
        const productTitle = product.node.title.toLowerCase();

        const chosenCats = selectedCats.map((c) => c.toLowerCase());
        const chosenTags = selectedTags.map((t) => t.toLowerCase());

        // 1) Category filter
        let catPass;
        if (chosenCats.includes("all")) {
            // We want to show everything EXCEPT the excluded categories
            // so pass if the product’s collections do NOT include any excluded handle
            catPass = !productCollections.some((c) => EXCLUDED_FROM_ALL.includes(c));
        } else {
            // same as before: pass if the product’s collections match any chosen
            catPass = productCollections.some((c) => chosenCats.includes(c));
        }

        // 2) Tag filter
        let tagPass = true;
        if (chosenTags.length > 0) {
            tagPass = chosenTags.some((t) => productTags.includes(t));
        }

        // 3) Search filter
        let searchPass = true;
        if (searchTerm.trim() !== "") {
            const st = searchTerm.toLowerCase();
            const inTitle = productTitle.includes(st);
            const inTags = productTags.some((tag) => tag.includes(st));
            if (!inTitle && !inTags) {
                searchPass = false;
            }
        }

        return catPass && tagPass && searchPass;
    });

    // Sorting logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const A = a.node;
        const B = b.node;
        switch (sortOption) {
            case "price":
                // Compare by first variant price
                const Aprice = parseFloat(A.variants.edges[0].node.priceV2.amount);
                const Bprice = parseFloat(B.variants.edges[0].node.priceV2.amount);
                return Aprice - Bprice;
            case "name":
                return A.title.localeCompare(B.title);
            case "collection":
                const Acol = A.collections.edges[0]?.node.handle || "";
                const Bcol = B.collections.edges[0]?.node.handle || "";
                return Acol.localeCompare(Bcol);
            default:
                return 0;
        }
    });

    const shopSEO = buildShopPageSEO(selectedCats, selectedTags);

    useEffect(() => {
        console.log(globalData.shop.categories);
    }, [globalData.shop.categories]);

    return (
        <>
            <MetaShopify data={shopSEO} />
            <MainContainer>
                <MobileFilterBar
                    categories={globalData.shop.categories}
                    selectedCats={selectedCats}
                    selectedTags={selectedTags}
                    onSelectCategory={handleSelectCategory}
                    onSelectTag={handleSelectTag}
                    onResetFilters={handleResetFilters}
                    allProducts={allProducts}
                />
                <div className="grid grid-cols-12 px-0 lg:px-0 gap-4">
                    <Sidebar
                        categories={globalData.shop.categories}
                        selectedCats={selectedCats}
                        selectedTags={selectedTags}
                        onSelectCategory={handleSelectCategory}
                        onSelectTag={handleSelectTag}
                        onResetFilters={handleResetFilters}
                        allProducts={allProducts}
                    />

                    <div className="col-span-12 lg:col-span-9 flex flex-col">
                        <TopBarFilter
                            selectedCats={selectedCats}
                            selectedTags={selectedTags}
                            totalCount={sortedProducts.length}
                            onRemoveCat={handleRemoveCat}
                            onRemoveTag={handleRemoveTag}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                            // Pass down the search state + setter
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                        {sortedProducts.length > 0 ? (
                            <ProductListings products={sortedProducts} />
                        ) : (
                            "Keine Produkte vorhanden"
                        )}
                    </div>
                </div>
            </MainContainer>
        </>
    );
}

export async function getServerSideProps() {
    const allProducts = await getAllProducts();
    const queryGlobal = `{ "shop": *[_type == "shop"][0] }`;
    const globalData = await client.fetch(queryGlobal);

    return {
        props: {
            allProducts: allProducts || [],
            globalData,
        },
    };
}
