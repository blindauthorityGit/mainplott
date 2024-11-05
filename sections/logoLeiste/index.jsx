import React, { useEffect } from "react";
import { CoverImage, ContainImage } from "../../components/images";
import urlFor from "../../functions/urlFor";

const LogoLeiste = ({ data, klasse }) => {
    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div className={`flex flex-wrap justify-center items-center gap-4 px-4 lg:px-24 mt-4 lg:mt-10 ${klasse}`}>
            {data?.map((e, i) => {
                return (
                    <div
                        className="w-[120px] opacity-50 relative h-[80px] lg:w-[200px] lg:h-[100px] flex-shrink-0 mx-auto"
                        key={`logo${i}`}
                    >
                        <ContainImage
                            src={urlFor(e).url()}
                            mobileSrc={urlFor(e).url()}
                            alt="Logo"
                            klasse="relative"
                            className="w-full h-full absolute object-contain"
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default LogoLeiste;
