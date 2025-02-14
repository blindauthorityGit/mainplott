import Head from "next/head";
import client from "../../client"; // Sanity client for data fetching
import { BasicPortableText } from "@/components/content";

export default function Datenschutz({ data }) {
    return (
        <>
            <Head>
                <title>Datenschutzerklärung | MainPlott</title>
                <meta name="description" content="Datenschutzerklärung von MainPlott" />
            </Head>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body text-textColor">
                <BasicPortableText value={data.content}></BasicPortableText>
            </main>
        </>
    );
}

export async function getServerSideProps() {
    // Example: fetch data from a "contactPage" or "aboutPage" document
    const query = `*[_type == "datenschutzPage"][0]`;
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
