import Head from "next/head";
import client from "../../client"; // Sanity client for data fetching
import { BasicPortableText } from "@/components/content";
import Meta from "/components/SEO/";

export default function Widerruf({ data }) {
    return (
        <>
            <Meta data={data.seo}></Meta>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body text-textColor">
                <BasicPortableText value={data.content}></BasicPortableText>
            </main>
        </>
    );
}

export async function getServerSideProps() {
    // Example: fetch data from a "contactPage" or "aboutPage" document
    const query = `*[_type == "widerrufPage"][0]`;
    // Adjust your query as needed.
    // If you have a different doc type or field for the hero image, update accordingly.

    const data = await client.fetch(query);

    // Return the fetched data as props
    return {
        props: {
            data,
        },
    };
}
