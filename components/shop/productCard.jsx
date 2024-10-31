import { CoverImage } from "../images";
import Link from "next/link";

function ProductCard({ product }) {
    const handle = product.node.handle;
    const title = product.node.title;
    const description = product.node.description;
    // const price = product.node.variants.edges[0].node.price;

    const imageNode = product.node.images.edges[0].node;

    return (
        <Link
            className="h-120 w-72 rounded shadow-lg mx-auto border border-palette-lighter"
            href={`/products/${handle}`}
            passHref
        >
            <div className="h-72 border-b-2 border-palette-lighter relative">
                <CoverImage
                    src={imageNode.originalSrc}
                    mobileSrc={imageNode.originalSrc}
                    alt="Cover Background"
                    klasse={"absolute lg:rounded-[20px]"}
                    className="aspect-[5/3] lg:aspect-[5/3] rounded-[10px] lg:rounded-[20px]"
                />
            </div>
            <div className="h-48 relative">
                <div className="font-primary text-palette-primary text-2xl pt-4 px-4 font-semibold">{title}</div>
                <div className="text-lg text-gray-600 p-4 font-primary font-light">{description}</div>
                <div
                    className="text-palette-dark font-primary font-medium text-base absolute bottom-0 right-0 mb-4 pl-8 pr-4 pb-1 pt-2 bg-palette-lighter 
            rounded-tl-sm triangle"
                ></div>
            </div>
        </Link>
    );
}

export default ProductCard;
