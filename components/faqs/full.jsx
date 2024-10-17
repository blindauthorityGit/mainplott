import React from "react";

import Element from "./element";

const Full = ({ data, klasse }) => {
    return (
        <div className={`${klasse}`}>
            {data.map((e, i) => {
                return <Element key={`faq${i}`} question={e.question} answer={e.answer}></Element>;
            })}
        </div>
    );
};

export default Full;
