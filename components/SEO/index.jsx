// components/Meta.js
import Head from "next/head";

import urlFor from "../../functions/urlFor";
import Logo from "../../assets/logoSM.png";

const Meta = ({ data }) => {
    const fallbackDescription = "MAINPLOTT";

    return (
        <Head>
            <title>{data.mainSEO.title ? data.mainSEO.title : "MAINPLOTT"}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="utf-8" />
            <meta
                name="description"
                content={data.mainSEO.description ? data.mainSEO.description : fallbackDescription}
            />
            {data.mainSEO.keywords ? (
                <meta name="keywords" content={data.mainSEO.keywords.map((e) => e)} />
            ) : (
                <meta name="keywords" content="Mainplott" />
            )}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            {/* <meta property="og:url" content={url} /> */}
            <meta property="og:title" content={data.mainSEO.title} />
            <meta property="og:description" content={data.mainSEO.description} />
            {/* Use ternary operator to check for ogImage existence */}
            <meta
                property="og:image"
                content={data.advancedSEO.ogImage ? urlFor(data.advancedSEO.ogImage) : Logo.src}
            />
            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            {/* <meta property="twitter:url" content={url} /> */}
            <meta property="twitter:title" content={data.mainSEO.title} />
            <meta property="twitter:description" content={data.mainSEO.description} />
            <meta property="twitter:image" content={data.advancedSEO.description} />
        </Head>
    );
};

export default Meta;
