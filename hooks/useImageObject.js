import { useState, useEffect } from "react";

// Hilfs-Hook für Bildobjekte
function useImageObject(file) {
    const [img, setImg] = useState(null);
    useEffect(() => {
        if (!file) return;
        const objectUrl = typeof file === "string" ? file : URL.createObjectURL(file);
        const image = new window.Image();
        image.src = objectUrl;
        image.onload = () => setImg(image);
        return () => {
            setImg(null);
            if (typeof file !== "string") URL.revokeObjectURL(objectUrl);
        };
    }, [file]);
    return img;
}

export default useImageObject;
