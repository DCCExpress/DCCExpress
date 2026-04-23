import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import LayoutPage from "./pages/LayoutPage";
import { MantineProvider, } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
// export function ThemeToggle() {
//   const { colorScheme, setColorScheme } = useMantineColorScheme();
//   const toggle = () => {
//     setColorScheme(colorScheme === "dark" ? "light" : "dark");
//   };
//   return (
//     <ActionIcon onClick={toggle} variant="default" size="lg">
//       {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
//     </ActionIcon>
//   );
// }
export default function App() {
    const [page, setPage] = useState("home");
    useEffect(() => {
        //alert("A lap megváltozott!" + page)
        if (page == "home") {
        }
    }, [page]);
    return (<MantineProvider>
      {/* 🔥 EZ KELL IDE */}
      <Notifications position="bottom-center" autoClose={2000}/>

      {page === "layout" ? (<LayoutPage onGoHome={() => setPage("home")}/>) : (<HomePage onOpenLayout={() => setPage("layout")}/>)}
    </MantineProvider>);
}
