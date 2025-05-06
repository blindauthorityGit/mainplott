import { useEffect } from "react";
import client from "../client"; // Import the Sanity client

//COMPONENTS
import { MainContainer } from "../layout/container";
import Spacer from "../layout/spacer";

//SECTIONS
import HeroSlider from "../sections/heroSlider";
import LinkBoxSection from "../sections/linkBoxes";
import IntroText from "../sections/introText";
import FeaturesSection from "../sections/features";
import FAQSection from "../sections/faqs";
import TestimonialsSection from "../sections/testimonials";
import PortfolioSlider from "../sections/portfolio";
import Meta from "/components/SEO/";

export default function Home({ sanityData, globalData }) {
    // Log the fetched data using useEffect
    useEffect(() => {}, [sanityData, globalData]);
    console.log(globalData);

    return (
        <>
            <Meta data={sanityData.seo}></Meta>
            <MainContainer>
                <HeroSlider data={sanityData.slider.slides} />
                <LinkBoxSection data={sanityData.linkBoxes}></LinkBoxSection>
                <Spacer></Spacer>
                <IntroText data={sanityData.textImageBlocks[0]}></IntroText>
                <Spacer></Spacer>
                <PortfolioSlider
                    data={globalData.portfolio}
                    headline={globalData.settings.portfolioHeadline}
                ></PortfolioSlider>
                <Spacer></Spacer>

                <FeaturesSection data={globalData.features.features}></FeaturesSection>
                <Spacer></Spacer>
                <IntroText data={sanityData.textImageBlocks[1]} order></IntroText>
                <Spacer></Spacer>
                <FAQSection faqs={globalData.faqs.faqs}></FAQSection>
                <Spacer></Spacer>
                <TestimonialsSection data={globalData.testimonials.testimonials}></TestimonialsSection>
                <Spacer></Spacer>
            </MainContainer>
        </>
    );
}

// Server-side data fetching function
export async function getServerSideProps() {
    // Fetch data from Sanity
    const query = `*[_type == "startPage"][0]`; // Adjust your query as needed
    const sanityData = await client.fetch(query);

    const queryGlobal = `{    "features": *[_type == "featuresSingleton"][0],
    "testimonials": *[_type == "testimonialsSingleton"][0],
    "faqs": *[_type == "faqsSingleton"][0],
    "settings": *[_type == "settingsSingleton"][0],
     "portfolio": *[_type == "portfolioItem"]}
  `; // Adjust your query as needed
    const globalData = await client.fetch(queryGlobal);

    // Return the fetched data as props
    return {
        props: {
            sanityData,
            globalData,
        },
    };
}
