import { useState, useEffect } from "react";

//SECTIONS
import HeaderText from "../../sections/headerText/index.jsx";
import LinkBoxSection from "../../sections/linkBoxes";
import LogoLeiste from "../../sections/logoLeiste";
import { MainContainer } from "../../layout/container";
import Spacer from "../../layout/spacer";

// SANITY
import client from "../../client";

export default function Partner({ data, globalData }) {
    useEffect(() => {
        console.log(data, globalData.settings.logos);
    }, [data, globalData]);

    return (
        <MainContainer>
            <HeaderText data={data}></HeaderText>
            <LinkBoxSection klasse="lg:!col-span-4" data={data.linkBoxes}></LinkBoxSection>
            <Spacer></Spacer>
            <LogoLeiste data={globalData.settings.logos}></LogoLeiste>
        </MainContainer>
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
        fallback: true,
        // fallback: process.env.NEXT_DEV === "true" ? false : true,
    };
};

export const getStaticProps = async (context) => {
    const slug = context.params.slug;
    console.log(slug);

    const res = await client.fetch(`*[_type == "servicePage" && slug.current == "${slug}"] 
    `);
    const data = await res[0];

    const queryGlobal = `{  
    "settings": *[_type == "settingsSingleton"][0]}
  `; // Adjust your query as needed
    const globalData = await client.fetch(queryGlobal);
    return {
        props: {
            data,
            globalData,
        },
        revalidate: 1, // 10 seconds
    };
};
