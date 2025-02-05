import React, { useState } from "react";
import { MainContainer } from "@/layout/container";
import { H2, P } from "@/components/typography";
import { Button, TextField } from "@mui/material";
import { motion } from "framer-motion";

export default function Vektorisieren() {
    // We now store the actual file object (for upload)
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [responseMsg, setResponseMsg] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResponseMsg("");

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("message", formData.message);
        data.append("file", file);

        try {
            const res = await fetch("/api/vektorisieren", {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            if (res.ok) {
                setResponseMsg("Ihre Anfrage wurde erfolgreich versendet!");
                // Optionally reset form fields here.
            } else {
                setResponseMsg("Beim Versenden der Anfrage ist ein Fehler aufgetreten.");
                console.error(json.error);
            }
        } catch (error) {
            console.error("Error submitting form", error);
            setResponseMsg("Beim Versenden der Anfrage ist ein Fehler aufgetreten.");
        }
        setSubmitting(false);
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
                <div className="mb-12 col-span-6">
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
                                {!previewUrl ? (
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
                                        src={previewUrl}
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
                            disabled={submitting}
                        >
                            {submitting ? "Bitte warten..." : "Absenden"}
                        </Button>

                        {responseMsg && <P klasse="text-center">{responseMsg}</P>}
                    </form>
                </div>
            </motion.div>
        </MainContainer>
    );
}
