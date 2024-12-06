import React, { useState } from "react";
import { MainContainer } from "@/layout/container"; // Assuming MainContainer is part of the layout structure
import { H2, P } from "@/components/typography"; // Typography components
import { Button, TextField } from "@mui/material"; // For form elements
import { motion } from "framer-motion"; // For subtle animations

export default function Vektorisieren() {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(URL.createObjectURL(selectedFile));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form data submitted:", formData, file);
        // Add logic to handle form submission (e.g., API call)
    };

    return (
        <MainContainer>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="grid grid-cols-12 px-4 lg:px-0 font-body pt-12"
            >
                {/* Header Section */}
                <div className=" mb-12 col-span-6">
                    <H2 klasse="text-primaryColor">Vektorisieren von Grafiken</H2>
                    <P klasse="mt-4 text-lg text-textColor">
                        Optimieren Sie Ihre Grafiken für perfekten Druck! Unser Vektorisierungsservice wandelt Ihre
                        Dateien in druckfertige Formate um. Laden Sie einfach Ihre Datei hoch und teilen Sie uns Ihre
                        Anforderungen mit.
                    </P>
                </div>

                {/* Form Section */}
                <div className="col-span-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl mx-auto">
                        {/* File Upload */}
                        <div className="flex flex-col">
                            <label className="font-semibold mb-2 text-textColor">Ihre Grafik hochladen</label>
                            <div className="border-dashed border-2 border-primaryColor p-6 rounded-md text-center">
                                {!file ? (
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <span className="text-primaryColor">Datei auswählen</span>
                                    </label>
                                ) : (
                                    <img
                                        src={file}
                                        alt="Preview"
                                        className="max-w-full h-auto mx-auto rounded-md shadow-md"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Name */}
                        <TextField
                            label="Name"
                            name="name"
                            variant="outlined"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        {/* Email */}
                        <TextField
                            label="E-Mail-Adresse"
                            name="email"
                            variant="outlined"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        {/* Phone */}
                        <TextField
                            label="Telefonnummer"
                            name="phone"
                            variant="outlined"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        {/* Message */}
                        <TextField
                            label="Ihre Nachricht oder Anforderungen"
                            name="message"
                            variant="outlined"
                            multiline
                            rows={4}
                            value={formData.message}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            className="bg-primaryColor text-white px-4 py-2 rounded"
                        >
                            Absenden
                        </Button>
                    </form>
                </div>
            </motion.div>
        </MainContainer>
    );
}
