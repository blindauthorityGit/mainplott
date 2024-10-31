import React from "react";

import { H1, H2, H3, P } from "@/components/typography";

const CpntentWrapper = ({ data, klasse, children }) => {
    return (
        <div className={`${klasse}`}>
            <H2>{data.title}</H2>
            <P klasse="lg:!text-sm">{data.description}</P>
            {children}
        </div>
    );
};

export default CpntentWrapper;
