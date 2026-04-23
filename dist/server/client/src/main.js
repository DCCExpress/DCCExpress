import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import App from "./App";
import "./i18n";
import { EditorSettingsProvider } from "./context/EditorSettingsContext";
const dcc = 'Other'; // This will be set by the server when it connects
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode>
    <ColorSchemeScript />
    <EditorSettingsProvider>
      <MantineProvider defaultColorScheme="dark">
        <App />
      </MantineProvider>
    </EditorSettingsProvider>
  </React.StrictMode>);
