import { CoverImage, ContainImage } from "../images";
import Link from "next/link";
import { getColorHex } from "@/libs/colors";
import CustomCheckBox from "@/components/inputs/customCheckBox";

import formatVariants from "@/functions/formatVariants";

function ProductCard({ product }) {
    const handle = product.node.handle;
    const title = product.node.title;
    const description = product.node.description;
    // const price = product.node.variants.edges[0].node.price;

    const imageNode = product.node.images.edges[0].node;

    // Format variants for easier access
    const formattedVariants = formatVariants(product.node.variants);
    console.log(formattedVariants);

    return (
        <Link
            className="h-120 w-72 rounded shadow-lg mx-auto border border-palette-lighter"
            href={`/products/${handle}`}
            passHref
        >
            <div className="h-72 border-b-2 border-palette-lighter relative">
                <ContainImage
                    src={imageNode.originalSrc}
                    mobileSrc={imageNode.originalSrc}
                    alt="Cover Background"
                    klasse={"absolute lg:rounded-[20px]"}
                    className="aspect-[5/3] lg:aspect-[5/3] rounded-[10px] lg:rounded-[20px]"
                />
            </div>
            <div className="h-48 relative">
                <div className="font-primary text-palette-primary text-2xl pt-4 px-4 font-semibold">{title}</div>
                {/* <div className="text-lg text-gray-600 p-4 font-primary font-light">{description}</div> */}
                <div className="text-lg text-gray-600 p-4 font-primary font-semibold">ab EUR 29,-</div>
                <div className=" flex justify-center space-x-4">
                    {formattedVariants["XL"]?.colors.map(({ color }, index) => (
                        <div
                            key={`color-${index}`}
                            klasse={`bg-${color}`}
                            // onClick={() => handleColorChange(color)}
                            className="  w-8 h-8 block rounded-full text-white"
                            nonActiveClass=" text-black"
                            style={{ background: getColorHex(color) }}
                        />
                    ))}
                </div>

                <div
                    className="text-palette-dark font-primary font-medium text-base absolute bottom-0 right-0 mb-4 pl-8 pr-4 pb-1 pt-2 bg-palette-lighter 
            rounded-tl-sm triangle"
                ></div>
            </div>
        </Link>
    );
}

export default ProductCard;
