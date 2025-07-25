import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="de">
            <Head>
                <link rel="stylesheet" href="https://use.typekit.net/kjg5tcx.css" />
            </Head>
            <body className="antialiased bg-background">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
