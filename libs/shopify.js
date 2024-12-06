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
    products (first: 10) {
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
                      metafield(namespace: "custom", key: "back_image") {
                          value
                      }
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
      collections(first: 20) {   // Fetch the first 10 collections, adjust if necessary
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
          id
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
          templatePositions: metafield(namespace: "template", key: "positions") {
              value
              type
              description
          }
          preisReduktion: metafield(namespace: "custom", key: "preis_reduktion") {
              value
              type
              description
          }
          konfigurator: metafield(namespace: "custom", key: "konfigurator") {
              value
              type
              description
          }
          textPersonalisierung: metafield(namespace: "custom", key: "text_inputbox") {
              value
              type
              description
          }
          simplePersonalisierung: metafield(namespace: "custom", key: "simple_personalisierung") {
              value
              type
              description
          }
          detailbeschreibung: metafield(namespace: "custom", key: "detailbeschreibung") {
              value
              type
              description
          }
          variants(first: 80) {
              edges {
                  node {
                      id  
                      title     
                      priceV2 {
                          amount
                          currencyCode
                      }
                      selectedOptions {
                          name
                          value
                      }
                      image {
                          originalSrc
                          altText
                      }
                      metafield(namespace: "custom", key: "back_image") {
                          value
                      }
                  }
              }
          }
      }
  }`;

    // Fetch the main product data
    const response = await callShopify(query);
    const product = response.data.productByHandle;

    // Create sizes array
    const sizes = product.variants.edges
        .map((variant) => variant.node.selectedOptions.find((option) => option.name === "Größe")?.value)
        .filter((size) => size);

    // Extract Metaobject IDs for colors from color-pattern metafield
    const colorPatternIds = product.metafield
        ? JSON.parse(product.metafield.value).map((id) => id.split("/").pop())
        : [];

    // Fetch back image URLs for all variants and embed them in the product
    const variantsWithBackImages = await Promise.all(
        product.variants.edges.map(async (variant) => {
            if (variant.node.metafield && variant.node.metafield.value) {
                const backImageUrl = await getBackImageUrl(variant.node.metafield.value);
                return {
                    ...variant.node,
                    backImageUrl,
                };
            }
            return {
                ...variant.node,
                backImageUrl: null,
            };
        })
    );

    // Attach the updated variants to the product object
    product.variants.edges = variantsWithBackImages.map((variant) => ({
        node: variant,
    }));

    // Fetch Veredelung Brust and Rücken products by handle or tags
    const veredelungQueryBrust = `{
  products(first: 1, query: "veredelung-brust") {
    edges {
      node {
        title
        handle

        preisReduktion: metafield(namespace: "custom", key: "preis_reduktion") {
          value
          type
          description
        }

        variants(first: 1) {
          edges {
            node {
              price  {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
`;
    const veredelungQueryRuecken = `{
  products(first: 1, query: "veredelung-rucken") {
    edges {
      node {
        title
        handle

        preisReduktion: metafield(namespace: "custom", key: "preis_reduktion") {
          value
          type
          description
        }

        variants(first: 1) {
          edges {
            node {
              price  {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
`;

    const veredelungBrustResponse = await callShopify(veredelungQueryBrust);
    const veredelungRueckenResponse = await callShopify(veredelungQueryRuecken);

    console.log("BRUST", veredelungBrustResponse.data.products.edges);
    console.log("RÜCKEN", veredelungRueckenResponse.data.products.edges);

    function parseVeredelungEdges(edges) {
        return edges.map((edge) => {
            const product = edge.node;

            return {
                title: product.title,
                handle: product.handle,
                preisReduktion: product.preisReduktion ? JSON.parse(product.preisReduktion.value) : null, // Parse the preisReduktion JSON value if it exists
                price: product.variants.edges[0]?.node.price.amount || null, // Fetch the price amount
                currency: product.variants.edges[0]?.node.price.currencyCode || null, // Fetch the currency
            };
        });
    }

    // Combine both responses into a neat package
    function parseVeredelungData(veredelungBrustEdges, veredelungRueckenEdges) {
        return {
            front: parseVeredelungEdges(veredelungBrustEdges)[0], // Process and return the first (and only) entry
            back: parseVeredelungEdges(veredelungRueckenEdges)[0], // Same for Rücken
        };
    }
    const parsedVeredelungData = parseVeredelungData(
        veredelungBrustResponse.data.products.edges,
        veredelungRueckenResponse.data.products.edges
    );

    const profiDatenCheckQuery = `{
        products(first: 1, query: "profi-datencheck") {
          edges {
            node {
              title
              handle
      
        
      
              variants(first: 1) {
                edges {
                  node {
                    price  {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
      `;

    const profiDatenCheck = await callShopify(profiDatenCheckQuery);
    const profiDatenCheckData = profiDatenCheck.data.products.edges;

    console.log("profiDatenCheck", profiDatenCheck.data.products.edges);

    return {
        ...response.data,
        sizes,
        colorPatternIds,
        product,
        parsedVeredelungData,
        profiDatenCheckData,
        // veredelungProducts, // Include in the final response
    };
}

export async function getAllProducts() {
    const query = `{
           products(first: 250, query: "-tag:veredelung") { 

            edges {
                node {
                    id
                    title
                    description
                    tags
                    vendor
                    handle
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
                                  priceV2 {
                          amount
                          currencyCode
                      }
                                selectedOptions {
                                    name
                                    value
                                }
                                image {
                                    originalSrc
                                    altText
                                }
                                metafield(namespace: "custom", key: "back_image") {
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;

    try {
        const response = await callShopify(query);

        // Safely handle null or undefined responses
        return response?.data?.products?.edges || [];
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
}

// Function to fetch back image URL based on metafield ID
export async function getBackImageUrl(mediaImageId) {
    console.log("Fetching back image URL with mediaImageId:", mediaImageId);

    const query = `{
      node(id: "${mediaImageId}") {
          ... on MediaImage {
              id
              image {
                  url
              }
          }
      }
  }`;

    try {
        const response = await callShopify(query);
        const backImageUrl = response?.data?.node?.image?.url || null;

        console.log("Fetched Back Image URL:", backImageUrl);
        return backImageUrl;
    } catch (error) {
        console.error("Error fetching back image URL:", error);
        return null;
    }
}

// libs/shopify.js

// libs/shopify.js

export async function getProductsByCategory(categoryHandle) {
    const query = `{
        collectionByHandle(handle: "${categoryHandle}") {
            products(first: 5) {  
                edges {
                    node {
                        id
                        title
                        handle
                        images(first: 1) {
                            edges {
                                node {
                                    originalSrc
                                    altText
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;

    try {
        const response = await callShopify(query);
        console.log(response);
        const products = response?.data?.collectionByHandle?.products?.edges.map((edge) => edge.node) || [];
        return products;
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return [];
    }
}

// libs/shopify.js

export async function fetchMetaobjects(metaobjectGids) {
    if (!metaobjectGids || metaobjectGids.length === 0) return [];

    const query = `query GetMetaobjects($ids: [ID!]!) {
        nodes(ids: $ids) {
            ... on Metaobject {
                id
                handle
                fields {
                    key
                    value
                }
            }
        }
    }`;

    const variables = {
        ids: metaobjectGids,
    };

    try {
        const response = await callShopify(JSON.stringify({ query, variables }));
        return response?.data?.nodes || [];
    } catch (error) {
        console.error("Error fetching metaobjects:", error);
        return [];
    }
}
