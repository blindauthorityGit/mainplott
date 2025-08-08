// src/hooks/useImageObjects.js
import { useEffect, useState } from "react";

export default function useImageObjects(files) {
    const [images, setImages] = useState([]);

    useEffect(() => {
        let isActive = true;
        const loadImages = async () => {
            const imagePromises = files.map((file) => {
                return new Promise((resolve) => {
                    if (!file) return resolve(null);
                    const img = new window.Image();
                    if (typeof file === "string") {
                        // Already a URL
                        img.src = file;
                        img.onload = () => resolve(img);
                        img.onerror = () => resolve(null);
                    } else {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            img.src = e.target.result;
                            img.onload = () => resolve(img);
                            img.onerror = () => resolve(null);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
            const loaded = await Promise.all(imagePromises);
            if (isActive) setImages(loaded);
        };
        loadImages();
        return () => {
            isActive = false;
        };
    }, [files]);

    console.log(images);

    return images;
}
