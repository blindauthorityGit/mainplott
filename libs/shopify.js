import shopify from "@shopify/shopify-api";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log(domain, token);

async function callShopify(query) {
    const fetchUrl = `https://${domain}/api/2023-01/graphql.json`;
    console.log(token, domain);

    const fetchOptions = {
        endpoint: fetchUrl,
        method: "POST",
        headers: {
            "X-Shopify-Storefront-Access-Token": token,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    };

    try {
        const data = await fetch(fetchUrl, fetchOptions).then((response) => response.json());
        return data;
    } catch (error) {
        throw new Error("Could not fetch products!");
    }
}
export async function getAllProductsInCollection(collection) {
    const query = `{
      collectionByHandle(handle: "${collection}") {
         id
        title
    products (first: 3) {
      edges {
        node {
          id
          title
          description
          handle
          tags
         images(first: 250) {
                edges {
                node {
                 id
                originalSrc
                  height
                   width
                  altText
                    }
                  }
                 }
        }
      }
    }
    }
  }`;

    const response = await callShopify(query);
    // const allProducts = response.data || [];
    console.log(response.data.collectionByHandle);
    const allProducts = response.data.collectionByHandle.products.edges
        ? response.data.collectionByHandle.products.edges
        : [];

    return allProducts;
}

export async function getAllCollectionsWithSubcollections() {
    const query = `{
      collections(first: 10) {   // Fetch the first 10 collections, adjust if necessary
        id
        title
    }`;
    // const query = `{
    //   collections(first: 10) {   // Fetch the first 10 collections, adjust if necessary
    //     edges {
    //       node {
    //         id
    //         handle
    //         title
    //       }
    //     }
    //   }
    // }`;

    const response = await callShopify(query);
    console.log("API Response:", response); // Hier prüfen wir die Struktur der Antwort

    const allCollections = response?.data?.collections?.edges
        ? response.data.collections.edges.map((edge) => ({
              id: edge.node.id,
              handle: edge.node.handle,
              title: edge.node.title,
          }))
        : [];

    return allCollections;
}

// libs/shopify.js

export async function getAllProductHandles() {
    const query = `{
    products(first: 100) {
      edges {
        node {
          handle
        }
      }
    }
  }`;

    const response = await callShopify(query);
    const handles = response.data.products.edges.map((edge) => edge.node.handle);
    return handles;
}

// libs/shopify.js

export async function getProductByHandle(handle) {
    const query = `{
    productByHandle(handle: "${handle}") {
      title
      description
      tags
      vendor
      images(first: 10) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
             metafield(namespace: "shopify", key: "color-pattern") {
          value
          type
          description
        }


      variants(first: 40) {  
        edges {
          node {
            title     
            selectedOptions {  
              name
              value
            }
            image {
              originalSrc
              altText
            }
          }
        }
      }
    }
  }`;

    const response = await callShopify(query);
    console.log(response);
    const product = response.data.productByHandle;

    // Größen-Array erstellen
    const sizes = product.variants.edges
        .map((variant) => variant.node.selectedOptions.find((option) => option.name === "Größe")?.value)
        .filter((size) => size); // Filtert undefined-Werte, falls einige Varianten keine Größe haben

    // Metaobject-IDs für Farben aus dem color-pattern Metafield extrahieren
    const colorPatternIds = product.metafield
        ? JSON.parse(product.metafield.value).map((id) => id.split("/").pop())
        : [];

    console.log("Farben Metaobject-IDs:", colorPatternIds);

    return { ...response.data, sizes, colorPatternIds };
}

// export async function getColorsFromMetaobjects(colorPatternIds) {
//     if (colorPatternIds.length === 0) return [];

//     // Formatierte IDs ohne zusätzliche Anführungszeichen
//     const formattedIds = colorPatternIds.map((id) => `\"gid://shopify/Metaobject/${id}\"`).join(", ");
//     console.log(formattedIds);
//     const query = `{
//           metaobject(id: "gid://shopify/Metaobject/117306458454") {
//         type
//     }}`;

//     const response = await callShopify(query);

//     if (response.errors) {
//         console.error("Shopify API Errors:", response.errors);
//         throw new Error("Error fetching colors from Metaobjects.");
//     }

//     // Farbwerte aus den Metafeldern extrahieren
//     // const colors = response.data.nodes
//     //     .map((node) => node.fields.find((field) => field.key === "color")?.value)
//     //     .filter((color) => color);

//     console.log("Farben:", response);
//     return response;
// }

// export async function fetchHexColorValue(metafieldId) {
//     const domain = process.env.SHOPIFY_STORE_DOMAIN;
//     const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

//     console.log(metafieldId, domain, token);
//     const response = await fetch(`https://b1d160-0f.myshopify.com/api/2023-01/metafields/117305835862.json`, {
//         method: "GET",
//         headers: {
//             "X-Shopify-Storefront-Access-Token": token,
//             Accept: "application/json",
//             "Content-Type": "application/json",
//         },
//     });

//     const data = await response.json();
//     console.log(data);
//     return data.metafield.value; // Hexwert
// }
