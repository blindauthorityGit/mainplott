import formidable from "formidable";
import fs from "fs";
import { PDFDocument } from "pdf-lib"; // Assuming you use pdf-lib

// Define a simple API route handler to analyze the uploaded PDF
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const form = formidable({ multiples: true, keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                return res.status(500).json({ error: "Error parsing the uploaded file" });
            }

            // Extract file from parsed files
            const file = files.file[0];
            if (!file) {
                console.error("No file received in the form");
                return res.status(400).json({ error: "No file received" });
            }

            const filePath = file.filepath;
            if (!filePath) {
                console.error("File path is missing or undefined");
                return res.status(400).json({ error: "File path is missing or undefined" });
            }

            try {
                // Read the PDF file and perform analysis
                const pdfData = fs.readFileSync(filePath);
                const pdfDoc = await PDFDocument.load(pdfData);

                // Extract metadata like the number of pages, author, etc.
                const numPages = pdfDoc.getPageCount();

                if (numPages > 1) {
                    return res.status(400).json({
                        error: "Only single-page PDFs are supported. Please upload a one-page document.",
                    });
                }

                // Send success response
                return res.status(200).json({
                    message: "PDF analyzed successfully",
                    numPages,
                });
            } catch (analyzeError) {
                console.error("Error analyzing the PDF:", analyzeError);
                return res.status(500).json({ error: "Error analyzing the PDF" });
            } finally {
                // Clean up the temporary file after processing
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Error deleting temporary file:", unlinkErr);
                    } else {
                        console.log("Temporary file deleted successfully");
                    }
                });
            }
        });
    } catch (error) {
        console.error("Unexpected error in API route:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// Explicitly tell Next.js not to parse the body
export const config = {
    api: {
        bodyParser: false,
    },
};
