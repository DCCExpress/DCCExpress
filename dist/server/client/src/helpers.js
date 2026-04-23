import { notifications } from "@mantine/notifications";
export function generateId() {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function showOkMessage(title, message) {
    notifications.show({
        title: title == "" ? "SUCCESSFULL" : title,
        message: message,
        color: "green",
        autoClose: 2000,
    });
}
export function showErrorMessage(title, message) {
    notifications.show({
        title: title,
        message: message,
        color: "red",
    });
}
export function isTouchDevice() {
    if (typeof window === "undefined")
        return false;
    return ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches);
}
