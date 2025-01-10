import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import client from "../../client";
import { MainContainer } from "../../layout/container";
import ProductListings from "../../components/shop/productListings";
import Sidebar from "../../components/shop/sidebar";
import TopBarFilter from "../../components/shop/topBarFilter";
import { getAllProducts, getAllCollectionsWithSubcollections } from "../../libs/shopify";

export default function Shop({ allProducts, globalData }) {
    const router = useRouter();
    const { cat, tags } = router.query;

    const initialCats = cat ? cat.split("+").filter(Boolean) : ["all"];
    const initialTags = tags ? tags.split("+").filter(Boolean) : [];

    const [selectedCats, setSelectedCats] = useState(initialCats);
    const [selectedTags, setSelectedTags] = useState(initialTags);
    const [sortOption, setSortOption] = useState("name"); // default sort by name

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

    const handleSelectTag = (categoryName, tagName) => {
        let newCats = [...selectedCats];
        let newTags = [...selectedTags];

        if (newCats.includes("all")) newCats = [];

        // If adding a tag, ensure the collection is included
        if (!newCats.includes(categoryName)) {
            newCats.push(categoryName);
        }

        if (newTags.includes(tagName)) {
            newTags = newTags.filter((t) => t !== tagName);
            // If removing a tag and no tags remain for that category, consider removing that category too?
            // We'll keep it simple and leave the category if no tags remain.
        } else {
            newTags.push(tagName);
        }

        if (newCats.length === 0) {
            newCats = ["all"];
        }

        setSelectedCats(newCats);
        setSelectedTags(newTags);
        updateURL(newCats, newTags);
    };

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

    // Filtering logic
    const filteredProducts = allProducts.filter((product) => {
        const productCollections = product.node.collections.edges.map((e) => e.node.handle.toLowerCase());
        const productTags = product.node.tags.map((t) => t.toLowerCase());

        const chosenCats = selectedCats.map((c) => c.toLowerCase());
        const chosenTags = selectedTags.map((t) => t.toLowerCase());

        // If "all" selected or no categories selected, that means no restriction by category.
        let catPass = true;
        if (!chosenCats.includes("all")) {
            // Product must match at least one chosen category (collection)
            catPass = productCollections.some((c) => chosenCats.includes(c));
        }

        let tagPass = true;
        if (chosenTags.length > 0) {
            // Product should show if it matches ANY chosen tag (not all)
            // If a product must match tags of multiple categories, we considered them collectively.
            // If you want OR logic: at least one chosen tag must be in productTags.
            tagPass = chosenTags.some((t) => productTags.includes(t));
        }

        return catPass && tagPass;
    });

    // Sorting logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const A = a.node;
        const B = b.node;
        switch (sortOption) {
            case "price":
                // Compare by first variant price for simplicity
                const Aprice = parseFloat(A.variants.edges[0].node.priceV2.amount);
                const Bprice = parseFloat(B.variants.edges[0].node.priceV2.amount);
                return Aprice - Bprice;
            case "name":
                return A.title.localeCompare(B.title);
            case "collection":
                // Sort by the first collection handle
                const Acol = A.collections.edges[0]?.node.handle || "";
                const Bcol = B.collections.edges[0]?.node.handle || "";
                return Acol.localeCompare(Bcol);
            default:
                return 0;
        }
    });

    return (
        <MainContainer>
            <div className="grid grid-cols-12 px-4 lg:px-0 gap-4">
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
                    />
                    {sortedProducts.length > 0 ? (
                        <ProductListings products={sortedProducts} />
                    ) : (
                        "Keine Produkte vorhanden"
                    )}
                </div>
            </div>
        </MainContainer>
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
