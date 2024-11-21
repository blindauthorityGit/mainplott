import React from "react";

const Info = ({ icon, children }) => {
    return (
        <div className="bg-accentColor rounded-[20px] p-2 lg:p-4 relative mt-2 first:lg:mt-8 hidden lg:block">
            <div className="absolute -left-6">
                <img src={icon} alt="" />
            </div>
            <div className="text font-body pl-16 pr-8 text-xs lg:text-sm">{children}</div>
        </div>
    );
};

export default Info;
