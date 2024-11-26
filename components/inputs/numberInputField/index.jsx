import React from "react";
import { Button, TextField } from "@mui/material";

const NumberInputField = ({ label, value, onIncrement, onDecrement, onChange }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ flex: "1", fontWeight: "bold" }}>{label}</span>
            <Button variant="outlined" onClick={onDecrement} style={{ minWidth: "40px" }}>
                -
            </Button>
            <TextField
                type="number"
                value={value}
                onChange={onChange}
                inputProps={{ min: 0 }}
                style={{ width: "60px" }}
            />
            <Button variant="outlined" onClick={onIncrement} style={{ minWidth: "40px" }}>
                +
            </Button>
        </div>
    );
};

export default NumberInputField;
