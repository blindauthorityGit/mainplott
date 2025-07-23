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

import MetaShopify from "@/components/SEO/shopify";
import MoreProducts from "@/sections/moreProducts";
import FAQSection from "@/sections/faqs";
import useStore from "@/store/store"; // Zustand store
import RichTextRenderer from "@/components/richTextRenderer";
import transformShopifyProductToSEO from "@/functions/transformShopifyProductToSEO.js";

//SHOPIFY
import { getAllProductHandles, getProductByHandle, getProductsByCategory } from "../../libs/shopify.js";

// SANITY
import client from "../../client";

import { useRouter } from "next/router";

export default function Product({ product, sizes, relatedProducts, category, globalData }) {
    const { resetPurchaseData, purchaseData } = useStore(); // Add a reset function in your Zustand store
    const router = useRouter();
    const { handle } = router.query; // Extract the product handle from the URL

    const [galleryImages, setGalleryImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const isEditing = router.query.editIndex != null;

    // Reset purchase data and images on product change
    useEffect(() => {
        if (!isEditing) resetPurchaseData();

        // Reset gallery images when the handle changes
        const customImages =
            product?.productByHandle?.customImages?.references?.edges.map(({ node }) => node.image.url) || [];
        setGalleryImages(customImages);

        // Reset the selected image to the first in the new gallery
        if (customImages.length > 0) {
            setSelectedImage(customImages[0]);
        }
    }, [handle, product, isEditing]);

    useEffect(() => {
        console.log("PÖRTSCHESE", purchaseData);
    }, [purchaseData]);

    // Extract the product title from the Shopify data
    const productTitle = product?.productByHandle?.title || "Unbekanntes Produkt";
    const seoData = transformShopifyProductToSEO(product.productByHandle);

    return (
        <>
            <MetaShopify data={seoData} />
            <MainContainer>
                <Breadcrumbs category={category} productTitle={productTitle} />
                {product?.productByHandle?.konfigurator?.value == "true" ? (
                    <ProductConfigurator
                        product={{
                            ...product?.productByHandle,
                            handle: product?.productByHandle?.handle || handle, // falls handle nicht gesetzt ist, nimm router.query.handle
                        }}
                        veredelungen={product?.parsedVeredelungData}
                        profiDatenCheck={product?.profiDatenCheckData}
                        layoutService={product?.layoutServiceData}
                        sizes={sizes}
                    ></ProductConfigurator>
                ) : (
                    <SimpleConfigurator product={product?.productByHandle}></SimpleConfigurator>
                )}
                {product?.productByHandle?.detailbeschreibung?.value ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 lg:mt-20 mb-16 lg:mb-4">
                        <div className="lg:pl-24  font-body text-sm lg:text-base text-textColor p-4 lg:p-2 lg:pr-24">
                            <RichTextRenderer
                                richText={JSON.parse(product?.productByHandle?.detailbeschreibung.value)}
                            />
                        </div>
                        {galleryImages.length > 0 && (
                            <div className="p-4 lg:p-2">
                                <SimpleGallery
                                    images={galleryImages}
                                    selectedImage={selectedImage}
                                    onSelectImage={setSelectedImage}
                                />
                            </div>
                        )}
                    </div>
                ) : null}
                <MoreProducts relatedProducts={relatedProducts} currentProductHandle={product} />
                <FAQSection faqs={globalData.faqs.faqs}></FAQSection>
            </MainContainer>
        </>
    );
}

export async function getStaticPaths() {
    const handles = await getAllProductHandles();
    const paths = handles.map((handle) => ({
        params: { handle },
    }));

    return {
        paths,
        fallback: "blocking",
    };
}

export async function getStaticProps({ params }) {
    const product = await getProductByHandle(params.handle);

    if (!product) {
        return { notFound: true };
    }

    const categoryTag = product.productByHandle.tags.find((tag) => tag.startsWith("category_"));
    const category = categoryTag ? categoryTag.replace("category_", "") : null;
    let relatedProducts = [];
    if (category) {
        relatedProducts = await getProductsByCategory(category);
    }

    const queryGlobal = `{    
        "features": *[_type == "featuresSingleton"][0],
        "testimonials": *[_type == "testimonialsSingleton"][0],
        "faqs": *[_type == "faqsSingleton"][0],
        "settings": *[_type == "settingsSingleton"][0]
    }`;
    const globalData = await client.fetch(queryGlobal);

    return {
        props: {
            product: product,
            sizes: product.sizes,
            relatedProducts: relatedProducts,
            category,
            globalData,
        },
        revalidate: 60,
    };
}
