import { CoverImage, ContainImage } from "../images";
import Link from "next/link";
import { getColorHex } from "@/libs/colors";
import formatVariants from "@/functions/formatVariants";
import { motion } from "framer-motion";

function ProductCard({ product }) {
    const handle = product.node.handle;
    const title = product.node.title;
    const description = product.node.description;

    // Extract main category and subcategory tags
    const mainCategoryTag = product.node.tags.find((tag) => tag.startsWith("category_"))?.replace("category_", "");
    const subCategoryTag = product.node.tags.find((tag) => tag.startsWith("subCategory_"))?.replace("subCategory_", "");

    const imageNode = product.node.images.edges[0].node;

    // Format variants for easier access
    const formattedVariants = formatVariants(product.node.variants);

    return (
        <motion.div
            className="lg:h-120 lg:w-72 w-full h-full rounded-lg shadow-lg mx-auto border border-gray-200 overflow-hidden bg-white relative"
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)" }}
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

            {/* Image */}
            <Link href={`/products/${handle}`} passHref>
                <div className="lg:h-72 h-64 border-b-2 border-gray-200 relative cursor-pointer overflow-hidden">
                    <ContainImage
                        src={imageNode.originalSrc}
                        mobileSrc={imageNode.originalSrc}
                        alt={title}
                        klasse={
                            "absolute w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
                        }
                    />
                </div>
            </Link>

            {/* Content */}
            <div className="h-48 lg:h-auto p-4 flex flex-col justify-between">
                <div>
                    <div className="font-primary text-palette-primary text-xl font-semibold truncate">{title}</div>
                    <div className="text-sm text-gray-500 mt-2 line-clamp-2 font-body">{description}</div>
                </div>
                <div>
                    <div className="text-lg text-gray-600 font-primary font-semibold mb-2">ab EUR 29,-</div>
                    <div className="flex  space-x-2 flex-wrap">
                        {formattedVariants["XL"]?.colors.map(({ color }, index) => (
                            <div
                                key={`color-${index}`}
                                className="w-6 h-6 block rounded-full border-2 border-white shadow"
                                style={{ background: getColorHex(color) }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default ProductCard;
