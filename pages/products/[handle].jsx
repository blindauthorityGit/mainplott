import { useState, useEffect } from "react";

//SECTIONS
import HeaderText from "../../sections/headerText/index.jsx";
import LinkBoxSection from "../../sections/linkBoxes";
import LogoLeiste from "../../sections/logoLeiste";
import { MainContainer } from "../../layout/container";
import ProductDetail from "../../sections/product";
import ProductConfigurator from "../../components/productConfigurator/index.jsx";
import Spacer from "../../layout/spacer";
import MoreProducts from "@/sections/moreProducts";
//SHOPIFY
import { getAllProductHandles, getProductByHandle, getProductsByCategory } from "../../libs/shopify.js";

// SANITY
import client from "../../client";

export default function Product({ product, sizes, relatedProducts }) {
    useEffect(() => {
        console.log(product.productByHandle, sizes, relatedProducts);
    }, [product, relatedProducts, sizes]);

    return (
        <MainContainer>
            <ProductConfigurator product={product.productByHandle} sizes={sizes}></ProductConfigurator>
            <MoreProducts relatedProducts={relatedProducts} />

            {/* <ProductDetail image={product.productByHandle.images.edges[0].node.originalSrc}></ProductDetail> */}
        </MainContainer>
    );
}

export async function getStaticPaths() {
    // Hole alle Produkt-Handles
    const handles = await getAllProductHandles();

    // Erzeuge einen Pfad für jedes Produkt
    const paths = handles.map((handle) => ({
        params: { handle },
    }));

    return {
        paths,
        fallback: "blocking", // 'blocking' oder 'true' erlaubt das on-demand Laden, falls nötig
    };
}

export async function getStaticProps({ params }) {
    // Hole die Produktdaten basierend auf dem Handle
    const product = await getProductByHandle(params.handle);

    if (!product) {
        return { notFound: true };
    }

    console.log("TAGS", product.productByHandle.tags);

    const categoryTag = product.productByHandle.tags.find((tag) => tag.startsWith("category_"));
    const category = categoryTag ? categoryTag.replace("category_", "") : null;
    let relatedProducts = [];
    if (category) {
        relatedProducts = await getProductsByCategory(category);
    }
    console.log(category);

    return {
        props: { product: product, sizes: product.sizes, relatedProducts: relatedProducts },

        revalidate: 60, // ISR, um die Seite alle 60 Sekunden neu zu generieren
    };
}
