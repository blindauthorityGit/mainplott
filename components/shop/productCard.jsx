import { CoverImage, ContainImage } from "../images";
import Link from "next/link";
import { getColorHex } from "@/libs/colors";
import formatVariants from "@/functions/formatVariants";
import { motion } from "framer-motion";

import calculateLowestPrice from "@/functions/calculateLowestPrice";

import { calculateNetPrice } from "@/functions/calculateNetPrice";
import useUserStore from "@/store/userStore";

function ProductCard({ product }) {
    const handle = product.node.handle;
    const title = product.node.title;
    const description = product.node.description;

    // Extract main category and subcategory tags
    const mainCategoryTag = product.node.tags.find((tag) => tag.startsWith("category_"))?.replace("category_", "");
    const subCategoryTag = product.node.tags.find((tag) => tag.startsWith("subCategory_"))?.replace("subCategory_", "");

    const imageNode = product.node?.images?.edges[0]?.node;

    // Format variants for easier access
    const formattedVariants = formatVariants(product.node.variants);
    const user = useUserStore((state) => state.user);

    // Determine if product belongs to one of the special collections
    const specialCollectionKeywords = ["kinder", "hochzeit", "geburt", "weihnachten", "geschenkidee"];
    const collections = product.node.collections?.edges || [];
    const isSpecialCollection = collections.some((edge) =>
        specialCollectionKeywords.some((keyword) => edge.node.handle.includes(keyword))
    );

    return (
        <motion.div
            className="lg:h-120 lg:w-64 w-full h-full rounded-[20px] mx-auto border border-gray-200 overflow-hidden bg-white relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {/* Tags */}
            <div className="absolute top-2 right-2 flex flex-wrap gap-2 z-10 font-body">
                {mainCategoryTag && (
                    <span className="bg-accentColor text-textColor font-body text-xs px-3 py-1 rounded-full shadow-md">
                        {mainCategoryTag}
                    </span>
                )}
                {subCategoryTag && (
                    <span className="bg-secondaryColor text-white text-xs px-3 py-1 rounded-full shadow-md">
                        {subCategoryTag}
                    </span>
                )}
            </div>

            {/* Image with tap/click animation */}
            <Link href={`/products/${handle}`} passHref>
                <motion.div
                    className="lg:h-64 h-48 border-b-2 border-gray-200 relative cursor-pointer overflow-hidden"
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <CoverImage
                        src={imageNode?.originalSrc}
                        mobileSrc={imageNode?.originalSrc}
                        alt={title}
                        klasse={
                            "absolute w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
                        }
                    />
                </motion.div>
            </Link>

            {/* Content */}
            <div className="h-auto lg:h-auto p-4 flex flex-col justify-between">
                <div>
                    <div className="font-body leading-tight text text-base text-textColor lg:text-xl font-semibold ">
                        {title}
                    </div>
                    <div className="text-xs mb-4 lg:mb-2 lg:text-sm text-textColor mt-2 line-clamp-2 font-body">
                        {description}
                    </div>
                </div>
                <div>
                    <div className="flex flex-wrap gap-x-2 gap-y-2 items-center lg:mt-2">
                        {isSpecialCollection ? (
                            <span className="text-xs text-textColor font-body">
                                in {product.node.variants.edges.length} Variationen
                            </span>
                        ) : (
                            <>
                                {Object.keys(formattedVariants)[0] &&
                                    formattedVariants[Object.keys(formattedVariants)[0]]?.colors
                                        .slice(0, 4)
                                        .map(({ color }, index) => (
                                            <div
                                                key={`color-${index}`}
                                                className="w-4 h-4 lg:w-5 lg:h-5 block rounded-full border-2 border-grey-500"
                                                style={{ background: getColorHex(color) }}
                                            />
                                        ))}
                                {formattedVariants[Object.keys(formattedVariants)[0]]?.colors.length > 4 && (
                                    <span className="text-xs text-textColor font-body">
                                        + {formattedVariants[Object.keys(formattedVariants)[0]]?.colors.length - 4}{" "}
                                        weitere Farben
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <div className="text-base lg:text-lg font-body text-gray-600 font-primary font-semibold mb-2 mt-4">
                        {calculateLowestPrice(product.node.variants.edges)}
                        {user?.userType == "firmenkunde" ? (
                            <p className="text-xs font-body font-thin">ohne MwSt.</p>
                        ) : (
                            <p className="text-xs font-body font-thin">inkl. MwSt.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default ProductCard;
