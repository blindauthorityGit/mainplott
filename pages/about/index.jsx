import { useState, useEffect } from "react";
import client from "../../client"; // Import the Sanity client

//COMPONENTS
import { MainContainer } from "../../layout/container";
import BasicHeroSection from "@/sections/basicHero";
import BasicText from "@/sections/basicText";
import BasicGallery from "@/sections/basicGallery";

//LIBS
import { getAllProductsInCollection, getAllCollectionsWithSubcollections } from "../../libs/shopify";

//STORE
import useStore from "../../store/store"; // Pfad zu deinem Zustand-Store

export default function About({ data }) {
    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <MainContainer>
            <BasicHeroSection data={data}></BasicHeroSection>
            <BasicText data={data.introText}></BasicText>
            <BasicGallery data={data.gallery}></BasicGallery>
            <BasicText data={data.moreText}></BasicText>
        </MainContainer>
    );
}

// Server-side data fetching function
export async function getServerSideProps() {
    // Fetch data from Sanity
    const query = `*[_type == "aboutPage"][0]`; // Adjust your query as needed
    const data = await client.fetch(query);

    // Return the fetched data as props
    return {
        props: {
            data,
        },
    };
}
