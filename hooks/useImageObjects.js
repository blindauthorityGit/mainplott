// src/hooks/useImageObjects.js
import { useEffect, useState } from "react";

export default function useImageObjects(sources) {
    const [images, setImages] = useState([]);

    useEffect(() => {
        let isActive = true;
        const objectURLs = [];

        const load = async () => {
            const promises = (sources || []).map(
                (src) =>
                    new Promise((resolve) => {
                        if (!src) return resolve(null);

                        const img = new window.Image(); // kein crossOrigin nötig für blob:/data:
                        const done = () => resolve(img);
                        const fail = () => resolve(null);

                        if (src instanceof Blob || src instanceof File) {
                            const url = URL.createObjectURL(src);
                            objectURLs.push(url);
                            img.onload = () => {
                                URL.revokeObjectURL(url);
                                done();
                            };
                            img.onerror = () => {
                                URL.revokeObjectURL(url);
                                fail();
                            };
                            img.src = url;
                            return;
                        }

                        if (typeof src === "string") {
                            // nur sichere Quellen zulassen
                            if (src.startsWith("data:") || src.startsWith("blob:")) {
                                img.onload = done;
                                img.onerror = fail;
                                img.src = src;
                                return;
                            }
                            // Harte Abweisung für http(s), damit kein Tainting passiert
                            console.warn("Ignored remote image URL to avoid CORS taint:", src);
                            return resolve(null);
                        }

                        resolve(null);
                    })
            );

            const loaded = await Promise.all(promises);
            if (isActive) setImages(loaded);
        };

        load();
        return () => {
            isActive = false;
            objectURLs.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [sources]);

    return images;
}
