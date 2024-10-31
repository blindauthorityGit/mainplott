// Importing necessary modules
import formidable from "formidable";
import sharp from "sharp";
import fs from "fs";
import ICC from "icc";

// Define a simple API route handler to analyze the uploaded image
export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Initialize Formidable to parse the incoming form data
        const form = formidable({ multiples: true, keepExtensions: true });

        // Parse the form to get the uploaded file
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                return res.status(500).json({ error: "Error parsing the uploaded file" });
            }

            // Log to confirm we got the file
            const file = files.file;
            if (!file) {
                console.error("No file received in the form");
                return res.status(400).json({ error: "No file received" });
            }

            console.log("File received:", file);

            // Use the filepath from the file object
            const filePath = file[0].filepath;
            if (!filePath) {
                console.error("File path is missing or undefined");
                return res.status(400).json({ error: "File path is missing or undefined" });
            }

            console.log("File path:", filePath);

            try {
                // Use Sharp to read the image and get metadata
                const image = sharp(filePath);
                const metadata = await image.metadata();

                console.log("Image Metadata:", metadata);

                // Extract color space and DPI information
                let colorSpace = metadata.space || "unknown";
                const dpi = metadata.density || "unknown";
                const alpha = metadata.hasAlpha || "unknown";
                const size = file[0].size || "unknown";
                const format = metadata.format || "unknown";

                // Handle dimensions properly
                const width = metadata.width || "unknown";
                const height = metadata.height || "unknown";
                const dimension = `${width} px X ${height} px`;

                console.log("Color Space:", colorSpace);
                console.log("DPI:", dpi);
                console.log("SIZE:", size);
                console.log("FORMAT:", format);
                console.log("dimensions:", dimension);
                console.log("alpha:", alpha);

                // Attempt to get ICC profile information
                let iccColorSpace = null;
                if (metadata.icc) {
                    try {
                        const iccBuffer = metadata.icc;
                        const parsedICC = ICC.parse(iccBuffer);
                        iccColorSpace = parsedICC.description;
                        console.log("ICC Color Space:", iccColorSpace);

                        if (parsedICC) {
                            // Check profile class to determine color space
                            if (parsedICC.deviceClass === "mntr" || parsedICC.deviceClass === "prtr") {
                                // Typically sRGB or similar
                                iccColorSpace = parsedICC.description || "RGB-based profile";
                            } else if (parsedICC.deviceClass === "scnr") {
                                iccColorSpace = "Scanner profile (possibly CMYK)";
                            } else if (parsedICC.colorSpace === "CMYK" || parsedICC.pcs === "CMYK") {
                                iccColorSpace = "CMYK";
                            } else if (parsedICC.colorSpace === "RGB" || parsedICC.pcs === "RGB") {
                                iccColorSpace = "RGB";
                            } else {
                                iccColorSpace = parsedICC.description || "Unknown ICC profile";
                            }
                        }
                    } catch (iccError) {
                        console.error("Error parsing ICC profile:", iccError);
                    }
                }

                // Update color space if ICC profile is available
                if (iccColorSpace) {
                    colorSpace = iccColorSpace;
                }

                console.log("Final Color Space:", colorSpace);

                // Send the extracted information back in the response
                return res.status(200).json({
                    message: "File analyzed successfully",
                    colorSpace,
                    dpi,
                    alpha,
                    size,
                    format,
                    dimension,
                });
            } catch (sharpError) {
                console.error("Error analyzing the image with Sharp:", sharpError);
                return res.status(500).json({ error: "Error analyzing the image" });
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
