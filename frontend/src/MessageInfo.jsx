import { useState, useEffect } from "react";

function MessageInfo({ message }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div
            className={`fixed bottom-40 left-1/2 z-999 max-w-xl -translate-x-1/2 rounded-xl border-2 border-slate-800 bg-amber-100/80 px-4 py-2 text-center text-xl transition-opacity duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
            {message}
        </div>
    );
}

export default MessageInfo;
