import Head from "next/head";
import { CoverImage } from "@/components/images"; // Custom CoverImage component, optional
import urlFor from "@/functions/urlFor"; // Sanity image helper, optional
import { H2, P } from "@/components/typography"; // Custom typography components
import client from "../../client"; // Sanity client for data fetching
import { BasicPortableText } from "@/components/content";
export default function Impressum({ data }) {
    return (
        <>
            <Head>
                <title>Impressum | MainPlott</title>
                <meta name="description" content="Impressum von MainPlott" />
            </Head>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body text-textColor">
                {/* Title */}

                <BasicPortableText value={data.content}></BasicPortableText>
            </main>
        </>
    );
}

export async function getServerSideProps() {
    // Example: fetch data from a "contactPage" or "aboutPage" document
    const query = `*[_type == "impressumPage"][0]`;
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
