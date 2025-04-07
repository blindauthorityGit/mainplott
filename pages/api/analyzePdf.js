// Importing necessary modules
import formidable from "formidable";
import fs from "fs";
import poppler from "pdf-poppler";
import { uploadPreviewToStorage } from "@/config/firebase";

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

            try {
                // Poppler setup
                const outputPath = `${filePath}-preview.png`;
                const options = {
                    format: "png",
                    out_dir: "./public", // Output directory for the generated preview image
                    out_prefix: "page",
                    page: 1, // Preview only the first page
                };

                await poppler.convert(filePath, options);

                // Return preview image URL for rendering on the client
                const previewUrl = `/public/${options.out_prefix}-1.png`;
                const previewFilePath = `${options.out_dir}/${options.out_prefix}-1.png`;
                const previewFileBuffer = fs.readFileSync(previewFilePath);

                const downloadURL = await uploadPreviewToStorage(previewFileBuffer, "preview.png");

                return res.status(200).json({
                    message: "PDF analyzed successfully",
                    numPages: 1, // Assuming single-page PDFs for this example
                    previewImage: downloadURL,
                });
            } catch (analyzeError) {
                console.error("Error analyzing the PDF:", analyzeError);
                return res.status(500).json({ error: "Error analyzing the PDF" });
            } finally {
                // Ensure that filePath exists before attempting to delete
                if (filePath) {
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("Error deleting temporary file:", unlinkErr);
                        } else {
                        }
                    });
                }
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
