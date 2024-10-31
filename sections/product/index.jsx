import React from "react";

//COMPS
import { ContainImage } from "@/components/images";

const ProductDetail = ({ image }) => {
    return (
        <div className="grid grid-cols-12">
            <div className="col-span-6 relative">
                <ContainImage
                    src={image}
                    mobileSrc={image}
                    alt="Cover Background"
                    klasse={"absolute"}
                    // style={{ }}
                    className="aspect-[7/9] mix-blend-multiply max-h-[600px] w-[60%] lg:w-full relative lg:static mx-auto"
                />
            </div>
            <div className="col-span-6"></div>
        </div>
    );
};

export default ProductDetail;
