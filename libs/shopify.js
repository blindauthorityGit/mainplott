import shopify from "@shopify/shopify-api";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

//

async function callShopify(query) {
    const fetchUrl = `https://${domain}/api/2023-01/graphql.json`;
    //

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
      products(first: 50) {
        edges {
          node {
            id
            title
            description
            handle
            tags
            images(first: 10) {
              edges { node { id originalSrc height width altText } }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            variants(first: 40) {
              edges {
                node {
                  id
                  title
                  priceV2 { amount currencyCode }
                  selectedOptions { name value }
                  image { originalSrc altText }
                  metafield(namespace: "custom", key: "back_image") { value }
                }
              }
            }
          }
        }
      }
    }
  }`;

    const response = await callShopify(query);
    return response?.data?.collectionByHandle?.products?.edges || [];
}

export async function getAllCollectionsWithSubcollections() {
    const query = `{
    collections(first: 20) {
      edges {
        node {
          id
          handle
          title
        }
      }
    }
  }`;

    const response = await callShopify(query);
    return response?.data?.collections?.edges
        ? response.data.collections.edges.map((edge) => ({
              id: edge.node.id,
              handle: edge.node.handle,
              title: edge.node.title,
          }))
        : [];
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
          konfigBox: metafield(namespace: "custom", key: "konfigurator_box") {
              value
          }
          mindestBestellMenge: metafield(namespace: "custom", key: "mindestbestellmenge") {
              value
          }
          preisModell: metafield(namespace: "custom", key: "preis_modell") {
              value
          }
          layout: metafield(namespace: "custom", key: "layout") {
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
                     backImage: metafield(namespace: "custom", key: "back_image") {
              value
            }
            configImage: metafield(namespace: "custom", key: "config_image") {
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

    if (!product) {
        // unknown handle -> let the page render 404
        return null;
    }
    // Create sizes array
    const sizes =
        product.variants?.edges
            .map((variant) => variant.node.selectedOptions?.find((option) => option.name === "Größe")?.value)
            .filter((size) => size) || [];

    // Extract Metaobject IDs for colors from color-pattern metafield
    const colorPatternIds = product.metafield
        ? JSON.parse(product.metafield.value).map((id) => id.split("/").pop())
        : [];

    // Process customImages if available (from the product level)
    const customImages = product.customImages?.references?.edges
        ? product.customImages.references.edges.map((edge) => ({
              id: edge.node.id,
              url: edge.node.image?.url,
              altText: edge.node.image?.altText,
          }))
        : [];

    // Fetch back image URLs for all variants and embed them in the product
    const variantsWithBackImages = await Promise.all(
        (product.variants?.edges || []).map(async (variant) => {
            const node = variant.node;
            let backImageUrl = null;
            if (node.backImage && node.backImage.value) {
                backImageUrl = await getBackImageUrl(node.backImage.value);
            }
            let configImageUrl = null;
            if (node.configImage && node.configImage.value) {
                configImageUrl = await getBackImageUrl(node.configImage.value);
            }
            return {
                ...node,
                backImageUrl,
                configImageUrl,
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

        variants(first: 4) {
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

    // *** NEW: Fetch LayoutService product ***
    const layoutServiceQuery = `{
    products(first: 1, query: "layoutservice") {
      edges {
        node {
          id
          title
          handle
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }`;
    const layoutServiceResponse = await callShopify(layoutServiceQuery);
    const layoutServiceData = layoutServiceResponse.data.products.edges;

    return {
        ...response.data,
        sizes,
        colorPatternIds,
        product,
        customImages, // From the product level metafield

        parsedVeredelungData,
        profiDatenCheckData,
        layoutServiceData, // Added layoutService data here

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
      products(first: 24) {
        edges {
          node {
            id
            title
            handle
            tags
            images(first: 1) {
              edges { node { originalSrc altText } }
            }
            # Produktweite Preisrange (min/max)
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            # Varianten inkl. Einzelpreis – wichtig für min-Preis-Fallbacks
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  priceV2 { amount currencyCode }
                  selectedOptions { name value }
                  image { originalSrc altText }
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
        // → Array von Product-Nodes zurückgeben (nicht edges)
        const products = response?.data?.collectionByHandle?.products?.edges?.map((e) => e.node) || [];
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

// export async function createCart(lineItems, cartAttributes, note) {
//     // Prepare the note field if provided.
//     const noteField = note && note.trim() !== "" ? `, note: ${JSON.stringify(note)}` : "";

//     // Construct the query dynamically with inlined lineItems and note (if any)
//     const query = `
//         mutation {
//             cartCreate(input: {
//                 lines: [
//                     ${lineItems
//                         .map(
//                             (item) => `{
//                         merchandiseId: "${item.variantId}",
//                         quantity: ${item.quantity},
//                         attributes: [
//                             ${
//                                 item.customAttributes
//                                     ?.map((attr) => `{ key: "${attr.key}", value: "${attr.value}" }`)
//                                     .join(", ") || ""
//                             }
//                         ]
//                     }`
//                         )
//                         .join(", ")}
//                 ],
//                      buyerIdentity: {
//         countryCode: DE
//       }
//                 attributes: [
//                     ${cartAttributes.map((attr) => `{ key: "${attr.key}", value: "${attr.value}" }`).join(", ")}
//                 ]
//                 ${noteField}

//             }) {
//                 cart {
//                     id
//                     checkoutUrl
//                     cost {
//                     subtotalAmount { amount currencyCode }
//                     totalTaxAmount { amount currencyCode }
//                     totalAmount { amount currencyCode }
//                     }
//                 }
//                 userErrors {
//                     field
//                     message
//                 }
//             }
//         }
//     `;

//     try {
//         const response = await callShopify(query);

//         if (response.errors) {
//             console.error("Shopify API Errors:", response.errors);
//             throw new Error("Invalid input for Shopify cartCreate mutation.");
//         }

//         const userErrors = response?.data?.cartCreate?.userErrors || [];
//         if (userErrors.length > 0) {
//             console.error("Shopify User Errors:", userErrors);
//             throw new Error(userErrors.map((error) => error.message).join(", "));
//         }

//         const cart = response?.data?.cartCreate?.cart;
//         if (cart?.checkoutUrl) {
//             return cart.checkoutUrl; // Return the checkout URL
//         } else {
//             throw new Error("No checkout URL returned!");
//         }
//     } catch (error) {
//         console.error("Shopify createCart Error:", error.message);
//         throw new Error("Could not create cart");
//     }
// }
export async function createCart(lineItems = [], cartAttributes = [], note) {
    const maxVal = (v) => String(v ?? "").slice(0, 240); // < 255 chars
    const esc = (v) => JSON.stringify(maxVal(v)); // → korrekt gequotet
    const keySan = (k) =>
        String(k ?? "")
            .replace(/[^\w-]/g, "_")
            .slice(0, 30);

    const linesStr = (lineItems || [])
        .map((item) => {
            const attrs = (item.customAttributes || [])
                .map((a) => `{ key: ${JSON.stringify(keySan(a.key))}, value: ${esc(a.value)} }`)
                .join(", ");

            return `{
      merchandiseId: ${JSON.stringify(item.variantId || item.merchandiseId)},
      quantity: ${Number(item.quantity || 1)},
      attributes: [${attrs}]
    }`;
        })
        .join(", ");

    const cartAttrsStr = (cartAttributes || [])
        .map((a) => `{ key: ${JSON.stringify(keySan(a.key))}, value: ${esc(a.value)} }`)
        .join(", ");

    const noteField = note && String(note).trim() ? `, note: ${JSON.stringify(String(note))}` : "";

    const query = `
    mutation {
      cartCreate(input: {
        lines: [ ${linesStr} ],
        buyerIdentity: { countryCode: DE }
        attributes: [ ${cartAttrsStr} ]
        ${noteField}
      }) {
        cart { id checkoutUrl
          cost { subtotalAmount { amount currencyCode } totalTaxAmount { amount currencyCode } totalAmount { amount currencyCode } }
        }
        userErrors { field message }
      }
    }
  `;

    try {
        const response = await callShopify(query);

        if (response?.errors?.length) {
            console.error("Shopify GraphQL errors:", response.errors);
            throw new Error("Invalid input for Shopify cartCreate mutation.");
        }

        const userErrors = response?.data?.cartCreate?.userErrors || [];
        if (userErrors.length) {
            console.error("Shopify User Errors:", userErrors, { lineItems, cartAttributes });
            throw new Error(userErrors.map((e) => e.message).join("; "));
        }

        const url = response?.data?.cartCreate?.cart?.checkoutUrl;
        if (!url) throw new Error("No checkout URL returned!");
        return url;
    } catch (err) {
        console.error("Shopify createCart Error:", err);
        throw new Error("Could not create cart");
    }
}
