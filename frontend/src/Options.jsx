import { EllipsisVertical, ArrowRight } from "lucide-react";

function Options({ setPopupOpen, popupOpen }) {
    const handleOptionsButton = () => {
        if (popupOpen === "options") {
            setPopupOpen(null);
        } else {
            setPopupOpen("options");
        }
    };
    return (
        <button
            className="fixed top-20 right-4 z-999 rounded-full border-2 border-slate-600 bg-white p-2 shadow-sm shadow-slate-500 transition-colors hover:cursor-pointer hover:bg-slate-100"
            onClick={handleOptionsButton}
        >
            {popupOpen === "options" ? (
                <ArrowRight size={32} color="#2e2e2e" />
            ) : (
                <EllipsisVertical size={32} color="#2e2e2e" />
            )}
        </button>
    );
}

export default Options;
