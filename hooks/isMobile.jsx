import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Function to determine if the device is mobile based on window width
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check on client-side rendering
        handleResize();

        // Add event listener for window resizing
        window.addEventListener("resize", handleResize);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [router.pathname]); // Run effect on route change to re-check the state

    return isMobile;
};

export default useIsMobile;

// Usage Example:
// import useIsMobile from 'path/to/useIsMobile';
// const isMobile = useIsMobile();
// console.log(isMobile); // true or false depending on the device
