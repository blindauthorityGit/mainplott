import React, { useEffect, useRef } from "react";
import { getDocument } from "pdfjs-dist";

const PdfPreview = ({ file }) => {
    const canvasRef = useRef();

    useEffect(() => {
        const renderPDF = async () => {
            try {
                const pdf = await getDocument(URL.createObjectURL(file)).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 }); // Adjust the scale as necessary
                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                await page.render(renderContext).promise;
            } catch (error) {
                console.error("Error rendering PDF:", error);
            }
        };

        renderPDF();
    }, [file]);

    return <canvas ref={canvasRef} className="w-full h-auto" />;
};

export default PdfPreview;
