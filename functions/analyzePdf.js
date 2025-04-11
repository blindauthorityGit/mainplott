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
//
//         return analysisResult;
//     } catch (error) {
//         console.error("Error analyzing PDF:", error);
//         throw error;
//     }
// };

// analyzePdf.js
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import { uploadPreviewToStorage } from "@/config/firebase";

if (typeof window !== "undefined") {
    // Must set before calling getDocument()
    // GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    GlobalWorkerOptions.workerSrc = "/pdf.worderNew.min.js";
}

export async function analyzePdf(file) {
    try {
        if (typeof window === "undefined") {
            // Guard: you can't run PDF rendering on the server in Vercel.
            throw new Error("PDF analysis must run in the browser.");
        }

        console.log("I AM RUNNNING");

        // 1) Convert the File -> ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        console.log(arrayBuffer);

        // 2) Load the PDF
        // const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
        const pdfDoc = await getDocument({ data: arrayBuffer }).promise;

        console.log(pdfDoc);

        // 3) Render the first page
        const page = await pdfDoc.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: true });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({
            canvasContext: ctx,
            viewport,
            background: "rgba(0,0,0,0)", // preserve transparency
        });
        // This should work properly now
        await renderTask.promise;

        // 4) Convert to data URL (PNG)
        const dataUrl = canvas.toDataURL("image/png");

        console.log(dataUrl);

        // 5) Turn that data URL into an ArrayBuffer for upload
        const response = await fetch(dataUrl);
        const previewFileBuffer = await response.arrayBuffer();

        // 6) Upload to Firebase using your existing function
        const previewDownloadUrl = await uploadPreviewToStorage(
            previewFileBuffer,
            file.name.replace(/\.pdf$/i, "") + "-preview.png"
        );

        // 7) Extract additional metadata
        const fileSize = file.size; // File size in bytes
        const colorSpace = ctx.getContextAttributes().alpha ? "RGBA" : "RGB"; // Check if alpha channel is present
        const alphaChannel = ctx.getContextAttributes().alpha; // Boolean indicating presence of alpha channel

        console.log(fileSize, colorSpace, alphaChannel);

        return {
            previewImage: previewDownloadUrl,
            numPages: pdfDoc.numPages,
            fileSize, // File size in bytes
            colorSpace, // Color space (RGBA or RGB)
            alphaChannel, // Boolean indicating presence of alpha channel
        };
    } catch (error) {
        console.error("Error analyzing PDF:", error);
        throw new Error("Failed to analyze PDF");
    }
}
