import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type EditorSettings = {
    showOccupacySensorAddress: boolean;
    showSensorAddress: boolean;
    showSignalAddress: boolean;
    showTurnoutAddress: boolean;

    showGrid: boolean;
    snapToGrid: boolean;
    showElementNames: boolean;
};

const STORAGE_KEY = "dcc-express.editor.settings";

const defaultEditorSettings: EditorSettings = {
    showOccupacySensorAddress: false,
    showSensorAddress: false,
    showSignalAddress: false,
    showTurnoutAddress: false,

    showGrid: true,
    snapToGrid: true,
    showElementNames: false,
};

type EditorSettingsContextValue = {
    settings: EditorSettings;
    setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
    updateSettings: (patch: Partial<EditorSettings>) => void;
    resetSettings: () => void;
};

const EditorSettingsContext = createContext<EditorSettingsContextValue | null>(null);

function loadSettings(): EditorSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultEditorSettings;

        const parsed = JSON.parse(raw) as Partial<EditorSettings>;

        return {
            showOccupacySensorAddress:
                typeof parsed.showOccupacySensorAddress === "boolean"
                    ? parsed.showOccupacySensorAddress
                    : defaultEditorSettings.showOccupacySensorAddress,
            showSensorAddress:
                typeof parsed.showSensorAddress === "boolean"
                    ? parsed.showSensorAddress
                    : defaultEditorSettings.showSensorAddress,
            showSignalAddress:
                typeof parsed.showSignalAddress === "boolean"
                    ? parsed.showSignalAddress
                    : defaultEditorSettings.showSignalAddress,
            showTurnoutAddress:
                typeof parsed.showTurnoutAddress === "boolean"
                    ? parsed.showTurnoutAddress
                    : defaultEditorSettings.showTurnoutAddress,


            showGrid:
                typeof parsed.showGrid === "boolean"
                    ? parsed.showGrid
                    : defaultEditorSettings.showGrid,
            snapToGrid:
                typeof parsed.snapToGrid === "boolean"
                    ? parsed.snapToGrid
                    : defaultEditorSettings.snapToGrid,
            showElementNames:
                typeof parsed.showElementNames === "boolean"
                    ? parsed.showElementNames
                    : defaultEditorSettings.showElementNames,
        };
    } catch {
        return defaultEditorSettings;
    }
}

export function EditorSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // ignore
        }
    }, [settings]);

    const value = useMemo<EditorSettingsContextValue>(() => {
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

    return (
        <EditorSettingsContext.Provider value={value}>
            {children}
        </EditorSettingsContext.Provider>
    );
}

export function useEditorSettings(): EditorSettingsContextValue {
    const ctx = useContext(EditorSettingsContext);
    if (!ctx) {
        throw new Error("useEditorSettings must be used inside EditorSettingsProvider");
    }
    return ctx;
}