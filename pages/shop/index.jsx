import { useState, useEffect } from "react";
import client from "../../client"; // Import the Sanity client

//COMPONENTS
import { MainContainer } from "../../layout/container";
import Spacer from "../../layout/spacer";
// import { ProductListings } from "../../components/shop";
import ProductListings from "../../components/shop/productListings";
import Sidebar from "../../components/shop/sidebar";
import TopBar from "../../components/shop/topBar";

//LIBS
import { getAllProductsInCollection, getAllCollectionsWithSubcollections, getAllProducts } from "../../libs/shopify";

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
        const category = router.query.cat || "streetwear";

        setActiveCategory(category);

        if (category.toLowerCase() === "all") {
            // Show all products without filtering
            setFilteredProducts(products);
            console.log(products);
        } else {
            // Filter products based on active tags
            setFilteredProducts(
                products.filter((product) => product.node.tags.some((tag) => activeTags.includes(tag)))
            );
        }
    }, [router.query.cat, products, activeTags, setActiveCategory]);

    console.log(products, collections, globalData, collection);

    return (
        <MainContainer>
            <div className="grid grid-cols-12 px-4 lg:px-0">
                <Sidebar activeCategory={collection} categories={globalData.shop.categories}></Sidebar>
                <TopBar
                    activeCategory={collection}
                    products={products}
                    categories={globalData.shop.categories}
                ></TopBar>
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
    let products = [];
    let collection = "Streetwear"; // Default category

    // Check for query parameter "cat"
    if (context.query.cat) {
        const category = context.query.cat.toLowerCase();
        if (category === "all") {
            // Fetch all products if "cat=all"
            products = await getAllProducts();
        } else {
            // Fetch products by specific collection
            collection = category;
            products = await getAllProductsInCollection(collection);
        }
    } else {
        // Default to fetching a specific category
        products = await getAllProductsInCollection(collection);
    }

    // Fetch collections and global data
    const collections = await getAllCollectionsWithSubcollections();

    const queryGlobal = `{  
        "shop": *[_type == "shop"][0]
    }`;
    const globalData = await client.fetch(queryGlobal);

    return {
        props: {
            products: products || [], // Ensure products is always an array
            collections,
            globalData,
            collection,
        },
    };
}
