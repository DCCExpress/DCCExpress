export default function BitToggleElement({ value, onChange, color0 = "#555", color1 = "#2ecc71", size = 32, }) {
    const handleClick = (val) => {
        if (val !== value) {
            onChange?.(val);
        }
    };
    return (<div style={{ display: "flex", gap: 4 }}>
      <div onClick={() => handleClick(false)} style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: 6,
            background: value === false ? color1 : "#222",
            color: "white",
            userSelect: "none",
            border: "1px solid #444",
            transition: "0.15s",
        }}>
        0
      </div>

      <div onClick={() => handleClick(true)} style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: 6,
            background: value === true ? color1 : "#222",
            color: "white",
            userSelect: "none",
            border: "1px solid #444",
            transition: "0.15s",
        }}>
        1
      </div>
    </div>);
}
