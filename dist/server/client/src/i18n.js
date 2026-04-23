import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import hu from "./i18n/hu.json";
import en from "./i18n/en.json";
const savedLang = localStorage.getItem("lang") || "en";
i18n.use(initReactI18next).init({
    resources: {
        hu: { translation: hu },
        en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});
export default i18n;
