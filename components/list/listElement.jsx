import React from "react";
import { MdWarning } from "react-icons/md";

const ListElement = ({ data, description, width, value, index, error, errorMessage, warning, warningMessage }) => {
    return (
        <div
            className={`flex items-center space-x-8 p-2 text-sm font-body ${
                index % 2 == 0 ? "" : "bg-primaryColor-100"
            }`}
        >
            <div className={`left lg:w-1/6 font-semibold flex items-center ${width}`}>{description}</div>
            <div
                className={`right space-x-2 flex items-center text-successColor ${error ? "!text-errorColor" : ""} ${
                    warning ? "!text-warningColor" : ""
                }`}
            >
                {value} {error && <MdWarning className="ml-2 text-errorColor" />}
                {warning && <MdWarning className="ml-2 text-warningColor" />}
                <p className="text-sm">
                    {warning && warningMessage} {error && errorMessage}
                </p>
            </div>
        </div>
    );
};

export default ListElement;
