import { Card } from "@mantine/core";
import { IconTrain } from "@tabler/icons-react";
export default function LocoImage({ image, name, width = 120, height = 90, clickable = false, onClick, }) {
    return (<Card radius="sm" p={0} style={{
            height,
            maxWidth: width,
            width: "auto",
            overflow: "hidden",
            cursor: clickable ? "pointer" : "default",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }} onClick={onClick}>
      {image ? (<img src={image} alt={name || "Mozdony"} style={{
                height: "100%",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
                display: "block",
            }}/>) : (<IconTrain size={Math.min(width, height) * 0.35}/>)}
    </Card>);
}
