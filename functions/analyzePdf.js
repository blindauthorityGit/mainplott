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
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import { uploadPreviewToStorage } from "@/config/firebase";

if (typeof window !== "undefined") {
    // Must set before calling getDocument()
    GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export async function analyzePdf(file) {
    try {
        if (typeof window === "undefined") {
            // Guard: you can't run PDF rendering on the server in Vercel.
            throw new Error("PDF analysis must run in the browser.");
        }

        // 1) Convert the File -> ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // 2) Load the PDF
        const pdfDoc = await getDocument({ data: arrayBuffer }).promise;

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

        // 5) Turn that data URL into an ArrayBuffer for upload
        const response = await fetch(dataUrl);
        const previewFileBuffer = await response.arrayBuffer();

        // 6) Upload to Firebase using your existing function
        const previewDownloadUrl = await uploadPreviewToStorage(
            previewFileBuffer,
            file.name.replace(/\.pdf$/i, "") + "-preview.png"
        );

        return {
            previewImage: previewDownloadUrl,
            // You can also return numPages if you like:
            numPages: pdfDoc.numPages,
        };
    } catch (error) {
        console.error("Error analyzing PDF:", error);
        throw new Error("Failed to analyze PDF");
    }
}
