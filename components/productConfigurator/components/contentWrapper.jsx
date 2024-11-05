import React from "react";

import { H1, H2, H3, P } from "@/components/typography";

const CpntentWrapper = ({ data, klasse, children }) => {
    return (
        <div className={`${klasse}`}>
            <H2>{data.title}</H2>
            <P klasse="text-xs hidden lg:block lg:!text-sm">{data.description}</P>
            {children}
            <P klasse="text-xs lg:hidden lg:!text-sm">{data.description}</P>
        </div>
    );
};

export default CpntentWrapper;
