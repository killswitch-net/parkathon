import { LocateFixed } from "lucide-react";

function Locate({ setCurrentLocation, setMarker, setMessage }) {
    const updateUserLocation = () => {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setMessage("Geolocation successful");
                        setCurrentLocation(location);
                        setMarker("parking");
                        resolve(position.coords);
                    },
                    (error) => {
                        setMessage("Geolocation failed");
                        // For some reason Chrome instantly throws an error when it asks for gps permission
                        reject(`Geolocation failed with error ${error}`);
                    },
                );
            } else {
                setMessage("Geolocation is not supported by your browser");
                reject("Geolocation is not supported by your browser");
            }
        });
    };

    return (
        <button
            className="fixed top-36 right-4 z-999 rounded-full border-2 border-slate-600 bg-white p-2 shadow-sm shadow-slate-500 transition-colors hover:cursor-pointer hover:bg-slate-100"
            onClick={updateUserLocation}
        >
            <LocateFixed size={32} color="#2e2e2e" />
        </button>
    );
}

export default Locate;
