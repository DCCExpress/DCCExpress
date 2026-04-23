import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMantineTheme, useMantineColorScheme } from "@mantine/core";
export default function PanelHandle({ side, collapsed, onToggle, style, }) {
    const [hover, setHover] = useState(false);
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";
    const isLeft = side === "left";
    // 🔥 SZÍNEK DINAMIKUSAN
    const bg = hover
        ? isDark
            ? theme.colors.dark[5]
            : theme.colors.gray[3]
        : isDark
            ? theme.colors.dark[6]
            : theme.colors.gray[1];
    const shadow = hover
        ? "0 2px 6px rgba(0,0,0,0.25)"
        : "0 1px 3px rgba(0,0,0,0.15)";
    const iconColor = isDark ? theme.colors.gray[0] : theme.colors.dark[7];
    const border = isDark ? "gray" : "gainsboro";
    const icon = isLeft
        ? collapsed
            ? <IconChevronRight size={18} color={iconColor}/>
            : <IconChevronLeft size={18} color={iconColor}/>
        : collapsed
            ? <IconChevronLeft size={18} color={iconColor}/>
            : <IconChevronRight size={18} color={iconColor}/>;
    return (<div onClick={onToggle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} title={collapsed
            ? isLeft
                ? "Loco panel mutatása"
                : "Property panel mutatása"
            : isLeft
                ? "Loco panel elrejtése"
                : "Property panel elrejtése"} style={{
            position: "absolute",
            top: "50%",
            transform: `translateY(-50%) scale(${hover ? 1.05 : 1})`,
            width: 11,
            height: 90,
            background: bg,
            border: `1px solid var(--mantine-color-dark-4)`,
            borderRadius: !isLeft ? "0 5px 5px 0" : "5px 0 0 5px",
            cursor: "pointer",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
            ...style,
        }}>
      {icon}
    </div>);
}
