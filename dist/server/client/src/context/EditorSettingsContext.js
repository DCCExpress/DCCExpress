import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
const STORAGE_KEY = "dcc-express.editor.settings";
const defaultEditorSettings = {
    showOccupacySensorAddress: false,
    showSensorAddress: false,
    showSignalAddress: false,
    showTurnoutAddress: false,
    showGrid: true,
    snapToGrid: true,
    showElementNames: false,
};
const EditorSettingsContext = createContext(null);
function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return defaultEditorSettings;
        const parsed = JSON.parse(raw);
        return {
            showOccupacySensorAddress: typeof parsed.showOccupacySensorAddress === "boolean"
                ? parsed.showOccupacySensorAddress
                : defaultEditorSettings.showOccupacySensorAddress,
            showSensorAddress: typeof parsed.showSensorAddress === "boolean"
                ? parsed.showSensorAddress
                : defaultEditorSettings.showSensorAddress,
            showSignalAddress: typeof parsed.showSignalAddress === "boolean"
                ? parsed.showSignalAddress
                : defaultEditorSettings.showSignalAddress,
            showTurnoutAddress: typeof parsed.showTurnoutAddress === "boolean"
                ? parsed.showTurnoutAddress
                : defaultEditorSettings.showTurnoutAddress,
            showGrid: typeof parsed.showGrid === "boolean"
                ? parsed.showGrid
                : defaultEditorSettings.showGrid,
            snapToGrid: typeof parsed.snapToGrid === "boolean"
                ? parsed.snapToGrid
                : defaultEditorSettings.snapToGrid,
            showElementNames: typeof parsed.showElementNames === "boolean"
                ? parsed.showElementNames
                : defaultEditorSettings.showElementNames,
        };
    }
    catch {
        return defaultEditorSettings;
    }
}
export function EditorSettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => loadSettings());
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
        catch {
            // ignore
        }
    }, [settings]);
    const value = useMemo(() => {
        return {
            settings,
            setSettings,
            updateSettings: (patch) => {
                setSettings((prev) => ({ ...prev, ...patch }));
            },
            resetSettings: () => {
                setSettings(defaultEditorSettings);
            },
        };
    }, [settings]);
    return (<EditorSettingsContext.Provider value={value}>
            {children}
        </EditorSettingsContext.Provider>);
}
export function useEditorSettings() {
    const ctx = useContext(EditorSettingsContext);
    if (!ctx) {
        throw new Error("useEditorSettings must be used inside EditorSettingsProvider");
    }
    return ctx;
}
