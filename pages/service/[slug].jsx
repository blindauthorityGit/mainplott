import { useState, useEffect } from "react";

//SECTIONS
import HeaderText from "../../sections/headerText/index.jsx";
import LinkBoxSection from "../../sections/linkBoxes";
import LogoLeiste from "../../sections/logoLeiste";
import { MainContainer } from "../../layout/container";
import Spacer from "../../layout/spacer";
import Meta from "@/components/SEO/";

// SANITY
import client from "../../client";

export default function Service({ data, globalData }) {
    useEffect(() => {
        console.log(data, data.seo);
    }, [data, globalData]);

    return (
        <>
            <Meta data={data?.seo}></Meta>
            <MainContainer>
                <HeaderText data={data && data}></HeaderText>
                <LinkBoxSection klasse="lg:!col-span-4 pt-6 lg:pt-0" data={data?.linkBoxes}></LinkBoxSection>
                <Spacer></Spacer>
                <LogoLeiste data={globalData?.settings?.logos}></LogoLeiste>
            </MainContainer>
        </>
    );
}

export const getStaticPaths = async () => {
    const res = await client.fetch(`*[_type in ["servicePage"] ]`);
    const data = await res;

    const paths = data.map((e) => {
        return {
            params: { slug: e.slug.current },
        };
    });
    return {
        paths,
        fallback: "blocking", // fallback: process.env.NEXT_DEV === "true" ? false : true,
    };
};

export const getStaticProps = async (context) => {
    const slug = context.params.slug;
    console.log(slug);

    const res = await client.fetch(`*[_type == "servicePage" && slug.current == "${slug}"]`);
    const data = res[0] || null; // Set to null if not found

    if (!data) {
        // Option 2: Return a 404 page if no data is found.
        return { notFound: true };
    }

    const queryGlobal = `{  
      "settings": *[_type == "settingsSingleton"][0]
    }`;
    const globalData = await client.fetch(queryGlobal);
    console.log(globalData, data);

    return {
        props: {
            data,
            globalData,
        },
        revalidate: 1,
    };
};
