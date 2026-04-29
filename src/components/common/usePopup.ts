import { useState } from "react";

interface PopupState {
    isOpen: boolean;
    type: "alert" | "confirm";
    message: string;
    onConfirm: () => void;
}

export const usePopup = () => {
    const [popup, setPopup] = useState<PopupState>({
        isOpen: false,
        type: "alert",
        message: "",
        onConfirm: () => {},
    });

    const closePopup = () => setPopup(p => ({ ...p, isOpen: false }));

    const showAlert = (message: string, onClose?: () => void) =>
        setPopup(
            { isOpen    : true, 
              type      : "alert", 
              message, 
              onConfirm : () => { 
                closePopup(); 
                if (onClose) setTimeout(onClose, 0); 
              }, 
            }
        );

    const showConfirm = (message: string, onConfirm: () => void) =>
        setPopup({ isOpen: true, type: "confirm", message, onConfirm });

    return { popup, showAlert, showConfirm, closePopup };
};
