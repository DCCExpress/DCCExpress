import { Box, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
export class ElementPreviewRenderer {
    static renderToCanvas(canvas, element, options = {
        showOccupancySensorAddress: false,
        showSensorAddress: false,
        showSignalAddress: false,
        showTurnoutAddress: false,
    }) {
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        element.draw(ctx, {
            overrideX: canvas.width / 2,
            overrideY: canvas.height / 2,
            ...options,
        });
    }
    static renderToDataUrl(width, height, element, options) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("CanvasRenderingContext2D could not be created.");
        }
        ctx.clearRect(0, 0, width, height);
        element.draw(ctx, {
            overrideX: width / 2,
            overrideY: height / 2,
            ...options,
        });
        return canvas.toDataURL("image/png");
    }
}
import { useEffect, useRef } from "react";
export default function ElementPreview({ element, label, width = 80, height = 80, options, scale = 0.9, className, onClick, }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        ElementPreviewRenderer.renderToCanvas(canvas, element, options);
    }, [element, options, width, height, scale]);
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const bg = colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0];
    return (<Box onClick={onClick} bg={bg} style={{
            width: "76px",
            height: "76px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: onClick ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            padding: "0px",
        }}>
      <Box style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0px",
            width: "100%",
            height: "100%",
            textAlign: "center",
        }}>
        <canvas ref={canvasRef} width={width} height={height} className={className} style={{
            scale: `${scale}`,
            width: `${width}px`,
            height: `${height}px`,
            display: "block",
            flex: "0 0 auto",
        }}/>
        {label && (<Text size="xs" ta="center">
            {label}
          </Text>)}
      </Box>
    </Box>);
}
