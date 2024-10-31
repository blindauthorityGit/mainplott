import React from "react";

const Info = ({ icon, children }) => {
    return (
        <div className="bg-primaryColor-100 rounded-[20px] p-4 relative lg:mt-8">
            <div className="absolute -left-6">
                <img src={icon} alt="" />
            </div>
            <div className="text font-body pl-16 pr-8">{children}</div>
        </div>
    );
};

export default Info;
