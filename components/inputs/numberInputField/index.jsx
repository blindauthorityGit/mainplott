import React from "react";
import { Button, TextField } from "@mui/material";

const NumberInputField = ({ label, value, onIncrement, onDecrement, onChange }) => {
    return (
        <>
            <div
                className="flex items-center gap-4 mb-1"
                // style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}
            >
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
            </div>{" "}
            <hr className="bg-textColor mb-1 text-textColor border-textColor  w-full opacity-30" />
        </>
    );
};

export default NumberInputField;
