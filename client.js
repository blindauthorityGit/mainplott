// client.js
import sanityClient from "@sanity/client";

export default sanityClient({
    projectId: "sd9ejs77", // you can find this in sanity.json
    dataset: "production", // or the name you chose in step 1
    apiVersion: "2023-10-11", // Use the latest or specific API version

    useCdn: false, // `false` if you want to ensure fresh data
});
