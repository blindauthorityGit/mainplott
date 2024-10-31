import React from "react";
import useStore from "@/store/store";

const LoadingSpinner = () => {
    const { showSpinner } = useStore();

    if (!showSpinner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-primaryColor"></div>
        </div>
    );
};

export default LoadingSpinner;
