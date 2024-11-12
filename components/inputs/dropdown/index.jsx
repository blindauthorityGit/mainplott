import React from "react";
import { Select, MenuItem } from "@mui/material";

const Dropdown = ({ label, value, onChange, options }) => (
    <div className="mb-4">
        <label className="block font-semibold mb-2 font-body">{label}:</label>
        <Select value={value} onChange={onChange} displayEmpty className="w-full rounded-[10px] !font-body border-2">
            <MenuItem value="">
                <em>Bitte wählen</em>
            </MenuItem>
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    </div>
);

export default Dropdown;
