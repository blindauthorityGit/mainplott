import React, { forwardRef } from "react";

import { MdOutlineClose } from "react-icons/md";

const ModalMobile = ({ ...props }, ref) => {
    return (
        <div
            ref={ref}
            className="slide-in-bottom  fixed  bottom-12 z-50 max-h-[100%] min-h-[70%] w-[100%] bg-white px-8 pt-2 pb-8 lg:w-[80%] lg:p-24"
        >
            <div
                className="closer absolute top-[-1rem] right-6 z-50 cursor-pointer rounded-full bg-white p-2 text-xl transition hover:opacity-50"
                onClick={props.onClick}
            >
                <MdOutlineClose className="rounded-full bg-white"></MdOutlineClose>
            </div>
            {props.children}
        </div>
    );
};

export default forwardRef(ModalMobile);
