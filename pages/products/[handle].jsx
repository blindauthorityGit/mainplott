import { useState, useEffect } from "react";

//SECTIONS
import HeaderText from "../../sections/headerText/index.jsx";
import LinkBoxSection from "../../sections/linkBoxes";
import LogoLeiste from "../../sections/logoLeiste";
import { MainContainer } from "../../layout/container";
import ProductDetail from "../../sections/product";
import ProductConfigurator from "../../components/productConfigurator/index.jsx";
import SimpleConfigurator from "../../components/simpleConfigurator";
import Breadcrumbs from "@/components/simpleConfigurator/components/breadcrumbs";
import { SimpleGallery } from "@/components/gallery";

import Spacer from "../../layout/spacer";
import MoreProducts from "@/sections/moreProducts";
import FAQSection from "@/sections/faqs";
import useStore from "@/store/store"; // Zustand store
// import { BasicPortableText } from "@/components/content";
import RichTextRenderer from "@/components/richTextRenderer";

//SHOPIFY
import { getAllProductHandles, getProductByHandle, getProductsByCategory } from "../../libs/shopify.js";

// SANITY
import client from "../../client";

import { useRouter } from "next/router";
import { BiCloudLightRain } from "react-icons/bi";

export default function Product({ product, sizes, relatedProducts, category, globalData }) {
    useEffect(() => {
        console.log("PRÖÖÖDUKT", product, relatedProducts);
    }, [product, relatedProducts, sizes]);

    const { resetPurchaseData } = useStore(); // Add a reset function in your Zustand store

    const router = useRouter();
    const { handle } = router.query; // Extract the product handle from the URL

    useEffect(() => {
        resetPurchaseData(); // Clear purchaseData when a new product is loaded
    }, [handle]); // Dependency ensures reset runs only on handle change

    // Extract the product title from the Shopify data
    const productTitle = product?.productByHandle?.title || "Unbekanntes Produkt";

    return (
        <MainContainer>
            <Breadcrumbs category={category} productTitle={productTitle} />
            {product?.productByHandle?.konfigurator?.value == "true" ? (
                <ProductConfigurator
                    product={product?.productByHandle}
                    veredelungen={product?.parsedVeredelungData}
                    profiDatenCheck={product?.profiDatenCheckData}
                    sizes={sizes}
                ></ProductConfigurator>
            ) : (
                <SimpleConfigurator product={product?.productByHandle}></SimpleConfigurator>
            )}
            {product?.productByHandle?.detailbeschreibung?.value ? (
                <div className="flex mt-4  lg:mt-20 flex-wrap lg:flex-nowrap mb-16 lg:mb-4">
                    <div className="lg:px-24 lg:w-2/4 lg:mt-16 font-body text-sm lg:text-base !text-textColor p-4 lg:p-2 lg:p-0">
                        <RichTextRenderer
                            richText={JSON.parse(product?.productByHandle?.detailbeschreibung.value)}
                        ></RichTextRenderer>
                    </div>
                    {product?.productByHandle?.customImages?.references?.edges?.length > 0 ? (
                        <SimpleGallery
                            images={product.productByHandle.customImages.references.edges.map(
                                ({ node }) => node.image.url
                            )}
                        />
                    ) : null}

                    <div className=""></div>
                </div>
            ) : (
                "null"
            )}{" "}
            <FAQSection faqs={globalData.faqs.faqs}></FAQSection>{" "}
            <MoreProducts relatedProducts={relatedProducts} currentProductHandle={product} />
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

    console.log("TAGS", product);

    const categoryTag = product.productByHandle.tags.find((tag) => tag.startsWith("category_"));
    const category = categoryTag ? categoryTag.replace("category_", "") : null;
    let relatedProducts = [];
    if (category) {
        relatedProducts = await getProductsByCategory(category);
    }
    console.log(category);

    const queryGlobal = `{    "features": *[_type == "featuresSingleton"][0],
    "testimonials": *[_type == "testimonialsSingleton"][0],
    "faqs": *[_type == "faqsSingleton"][0],
    "settings": *[_type == "settingsSingleton"][0]}
  `; // Adjust your query as needed
    const globalData = await client.fetch(queryGlobal);

    return {
        props: { product: product, sizes: product.sizes, relatedProducts: relatedProducts, category, globalData },

        revalidate: 60, // ISR, um die Seite alle 60 Sekunden neu zu generieren
    };
}
