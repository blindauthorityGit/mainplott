//ImageBuilder
import myConfiguredSanityClient from "../client";

import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(myConfiguredSanityClient);

export default function urlFor(source) {
    return builder.image(source);
}
