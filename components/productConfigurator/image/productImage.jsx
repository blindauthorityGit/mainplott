import React from "react";

//COMPS
import { ContainImage } from "@/components/images";

const ProductImage = ({ image }) => {
    return (
        <>
            <ContainImage
                src={image}
                mobileSrc={image}
                alt="Cover Background"
                klasse={"absolute"}
                // style={{ }}
                className="aspect-[7/9] mix-blend-multiply max-h-[800px] w-[60%] lg:w-full relative lg:static mx-auto"
            />
        </>
    );
};

export default ProductImage;
