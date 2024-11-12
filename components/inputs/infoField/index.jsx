import React from "react";
import { TextField } from "@mui/material";

const AdditionalInfoField = ({ value, onChange }) => (
    <div className="mb-4">
        <label className="block font-semibold mb-2">Weitere Wünsche oder Infos:</label>
        <TextField
            value={value}
            onChange={onChange}
            variant="outlined"
            placeholder="Ihre Wünsche oder Infos eingeben"
            fullWidth
            multiline
            rows={3}
        />
    </div>
);

export default AdditionalInfoField;
