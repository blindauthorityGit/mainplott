import { useState, useEffect } from "react";

//SECTIONS
import HeaderText from "../../sections/headerText/index.jsx";
import LinkBoxSection from "../../sections/linkBoxes";
import LogoLeiste from "../../sections/logoLeiste";
import { MainContainer } from "../../layout/container";
import ProductDetail from "../../sections/product";
import ProductConfigurator from "../../components/productConfigurator/index.jsx";
import Spacer from "../../layout/spacer";

//SHOPIFY
import { getAllProductHandles, getProductByHandle, fetchHexColorValue } from "../../libs/shopify.js";

// SANITY
import client from "../../client";

export default function Product({ product, sizes }) {
    useEffect(() => {
        console.log(product.productByHandle, sizes);
    }, [product, sizes]);

    return (
        <MainContainer>
            <ProductConfigurator product={product.productByHandle} sizes={sizes}></ProductConfigurator>
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

    return {
        props: { product: product, sizes: product.sizes },
        revalidate: 60, // ISR, um die Seite alle 60 Sekunden neu zu generieren
    };
}
