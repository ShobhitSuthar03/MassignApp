import React from "react";
import { FaDrawPolygon, FaVectorSquare, FaMousePointer, FaRulerCombined, FaTrash, FaCube } from "react-icons/fa";

const actions = [
  { key: "drawPolygon", icon: <FaDrawPolygon />, label: "Draw Polygon" },
  { key: "drawRectangle", icon: <FaVectorSquare />, label: "Draw Rectangle" },
  { key: "drawCore", icon: <FaCube />, label: "Draw Core" },
  { key: "select", icon: <FaMousePointer />, label: "Select" },
  { key: "calibrate", icon: <FaRulerCombined />, label: "Calibrate PDF" },
  { key: "delete", icon: <FaTrash />, label: "Delete" },
];

export default function VerticalToolbar({ active, onAction }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      padding: "12px 8px",
      border: "1px solid #e2e8f0"
    }}>
      {actions.map(action => (
        <button
          key={action.key}
          title={action.label}
          onClick={() => onAction(action.key)}
          style={{
            background: active === action.key ? "#3182ce" : "transparent",
            color: active === action.key ? "#fff" : "#222",
            border: "none",
            borderRadius: 6,
            padding: 10,
            cursor: "pointer",
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
} 