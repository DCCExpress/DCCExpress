import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import App from "./App";
import "./i18n";
import { EditorSettingsProvider } from "./context/EditorSettingsContext";
import { CommandCenterProvider } from "./context/CommandCenterContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorSchemeScript />
      <CommandCenterProvider>
    <EditorSettingsProvider>
      <MantineProvider defaultColorScheme="dark">
        <App />
      </MantineProvider>
    </EditorSettingsProvider>
    </CommandCenterProvider>
  </React.StrictMode>
);