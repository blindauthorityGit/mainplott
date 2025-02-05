import shopify from "@shopify/shopify-api";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// console.log(domain, token);

async function callShopify(query) {
    const fetchUrl = `https://${domain}/api/2023-01/graphql.json`;
    // console.log(token, domain);

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
        const response = await fetch(fetchUrl, fetchOptions);
        const data = await response.json();
        console.log("Shopify API Response:", data); // Log full response
        if (data.errors) {
            console.error("Shopify API Errors:", data.errors);
        }
        return data;
    } catch (error) {
        console.error("Shopify API Error:", error.message);
        throw new Error("Could not fetch data!");
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
          descriptionHtml 
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
          fixedPositions: metafield(namespace: "custom", key: "positioning") {
              value
            
          }

       customImages: metafield(namespace: "custom", key: "custom_images") {
            references(first: 10) {
                edges {
                    node {
                        ... on MediaImage {
                            id
                            image {
                                url
                                altText
                            }
                        }
                    }
                }
            }
        }

          variants(first: 120) {
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
      id
        title
        handle

        preisReduktion: metafield(namespace: "custom", key: "preis_reduktion") {
          value
          type
          description
        }

        variants(first: 3) {
          edges {
            node {
             id  
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
       id  
        title
        handle

        preisReduktion: metafield(namespace: "custom", key: "preis_reduktion") {
          value
          type
          description
        }

        variants(first: 5) {
          edges {
            node {
             id  
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
                id: product.id,
                handle: product.handle,
                preisReduktion: product.preisReduktion ? JSON.parse(product.preisReduktion.value) : null, // Parse the preisReduktion JSON value if it exists
                price: product.variants.edges[0]?.node.price.amount || null, // Fetch the price amount
                currency: product.variants.edges[0]?.node.price.currencyCode || null, // Fetch the currency
                variants: product.variants || null, // Fetch the currency
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
             id  
              title
              handle
      
        
      
              variants(first: 1) {
                edges {
                  node {

                 id  
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
       products(first: 250, query: "-tag:veredelung -title:'profi datencheck'") { 

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
                                            collections(first: 5) { 
                        edges {
                            node {
                                id
                                title
                                handle
                                description
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
            products(first: 20) {  
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

// libs/shopify.js

export async function createCart(lineItems, cartAttributes, note) {
    console.log("LINE ITEMS", lineItems);
    console.log("cartAttributes", cartAttributes);

    // Prepare the note field if provided.
    const noteField = note && note.trim() !== "" ? `, note: ${JSON.stringify(note)}` : "";
    console.log("NOTE", noteField);
    // Construct the query dynamically with inlined lineItems and note (if any)
    const query = `
        mutation {
            cartCreate(input: {
                lines: [
                    ${lineItems
                        .map(
                            (item) => `{
                        merchandiseId: "${item.variantId}",
                        quantity: ${item.quantity},
                        attributes: [
                            ${
                                item.customAttributes
                                    ?.map((attr) => `{ key: "${attr.key}", value: "${attr.value}" }`)
                                    .join(", ") || ""
                            }
                        ]
                    }`
                        )
                        .join(", ")}
                ],  
                attributes: [
                    ${cartAttributes.map((attr) => `{ key: "${attr.key}", value: "${attr.value}" }`).join(", ")}
                ]
                ${noteField}
            }) {
                cart {
                    id
                    checkoutUrl
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    console.log("Constructed Query:", query);

    try {
        const response = await callShopify(query);

        if (response.errors) {
            console.error("Shopify API Errors:", response.errors);
            throw new Error("Invalid input for Shopify cartCreate mutation.");
        }

        const userErrors = response?.data?.cartCreate?.userErrors || [];
        if (userErrors.length > 0) {
            console.error("Shopify User Errors:", userErrors);
            throw new Error(userErrors.map((error) => error.message).join(", "));
        }

        const cart = response?.data?.cartCreate?.cart;
        if (cart?.checkoutUrl) {
            console.log("CHECKOUT URL:", cart.checkoutUrl);
            return cart.checkoutUrl; // Return the checkout URL
        } else {
            throw new Error("No checkout URL returned!");
        }
    } catch (error) {
        console.error("Shopify createCart Error:", error.message);
        throw new Error("Could not create cart");
    }
}
