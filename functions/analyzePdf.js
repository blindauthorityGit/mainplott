// export const analyzePdf = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//         const response = await fetch("/api/analyzePdf", {
//             method: "POST",
//             body: formData,
//         });

//         if (!response.ok) {
//             throw new Error(`Error analyzing PDF: ${response.statusText}`);
//         }

//         const analysisResult = await response.json();
//         console.log(analysisResult);
//         return analysisResult;
//     } catch (error) {
//         console.error("Error analyzing PDF:", error);
//         throw error;
//     }
// };

// analyzePdf.js
// analyzePdf.js
import * as pdfjsLib from "pdfjs-dist";

// Make sure this only runs in the browser
if (typeof window !== "undefined") {
    // Set the workerSrc to your own hosted file
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export async function analyzePdf(file) {
    try {
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocument = await loadingTask.promise;

        const page = await pdfDocument.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render it
        await page.render({
            canvasContext: context,
            viewport,
        }).promise;

        // Convert the canvas to a data URL
        const dataURL = canvas.toDataURL("image/png");

        console.log(dataURL);

        return {
            previewImage: dataURL,
            numPages: pdfDocument.numPages,
        };
    } catch (error) {
        console.error("Error analyzing PDF:", error);
        throw new Error("Failed to analyze PDF");
    }
}
