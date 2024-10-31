import { useState, useEffect } from "react";
import client from "../../client"; // Import the Sanity client

//COMPONENTS
import { MainContainer } from "../../layout/container";
import Spacer from "../../layout/spacer";
// import { ProductListings } from "../../components/shop";
import ProductListings from "../../components/shop/productListings";
import Sidebar from "../../components/shop/sidebar";

//LIBS
import { getAllProductsInCollection, getAllCollectionsWithSubcollections } from "../../libs/shopify";

//STORE
import useStore from "../../store/store"; // Pfad zu deinem Zustand-Store

//ROUTER
import { useRouter } from "next/router";

export default function Shop({ products, collections, globalData, collection }) {
    const router = useRouter();

    const [filteredProducts, setFilteredProducts] = useState(products);
    const { activeCategory, setActiveCategory, setActiveTags, activeTags, addTag, removeTag, setActiveSubCategory } =
        useStore();

    useEffect(() => {
        // Hole die Kategorie aus der URL oder setze sie standardmäßig auf "streetwear"
        const category = router.query.cat || "streetwear";
        console.log(category);

        // Setze die aktive Kategorie im Zustand
        setActiveCategory(category);
        setActiveSubCategory();
    }, [router.query.cat, setActiveCategory]);

    // Log the fetched data using useEffect
    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    useEffect(() => {
        setFilteredProducts(products.filter((product) => product.node.tags.some((tag) => activeTags.includes(tag))));
    }, [activeTags, products]);

    return (
        <MainContainer>
            <div className="grid grid-cols-12">
                <Sidebar activeCategory={collection} categories={globalData.shop.categories}></Sidebar>
                {filteredProducts.length > 0 ? (
                    <ProductListings products={filteredProducts}></ProductListings>
                ) : (
                    "Keine Produckte vorhanden"
                )}
            </div>{" "}
        </MainContainer>
    );
}

// Server-side data fetching function
export async function getServerSideProps(context) {
    // Default category
    let collection = "Streetwear";
    console.log(context);
    // Check for query parameter "cat"
    if (context.query.cat) {
        collection = context.query.cat; // Dynamically set the collection
    }

    // Fetch the products from Shopify based on the collection
    const products = await getAllProductsInCollection(collection);
    const collections = await getAllCollectionsWithSubcollections();

    const queryGlobal = `{  
        "shop": *[_type == "shop"][0]}
      `; // Adjust your query as needed
    const globalData = await client.fetch(queryGlobal);

    // Return the fetched data as props
    return {
        props: {
            products,
            collections,
            globalData,
            collection,
        },
    };
}
