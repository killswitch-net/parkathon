import { CircleParkingOff, ArrowRight } from "lucide-react";
import { getActiveParkingSpots } from "./api/getActiveParkingSpots";
import { renameCoordinates } from "./utils/formatCoordinates";

function ParkingSpots({
    userId,
    popupOpen,
    setPopupOpen,
    setIsLoading,
    setActiveParkingSpots,
}) {
    const handleParkingSpotsButton = async () => {
        if (popupOpen === "parking") {
            setPopupOpen(null);
            return;
        }

        try {
            setIsLoading(true);
            setPopupOpen("parking");
            let spots = await getActiveParkingSpots(userId);
            spots = renameCoordinates(spots);
            setActiveParkingSpots(spots);

            // Mock data
            // const spots = [
            //     { lat: 37.9838, lng: 23.7275, parking_id: "p1" },
            //     { lat: 37.9848, lng: 23.7285, parking_id: "p2" },
            //     { lat: 37.9858, lng: 23.7295, parking_id: "p3" },
            // ];

            const spotsWithNames = await Promise.all(
                spots.map(async (spot) => {
                    const streetName = await getStreetName(spot.lat, spot.lng);
                    return { ...spot, name: streetName };
                }),
            );
            setActiveParkingSpots(spotsWithNames);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setPopupOpen(null);
            console.error("Error getting active parking spots:", error);
        }
    };

    const getStreetName = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
                const addressComponents = data.results[0].address_components;
                const streetName =
                    addressComponents.find((component) =>
                        component.types.includes("route"),
                    )?.long_name || "Unknown Street";
                return streetName;
            }
            return "Unknown Location";
        } catch (error) {
            console.error("Error getting street name:", error);
        }
    };

    return (
        <button
            className="fixed top-4 right-4 z-999 rounded-full border-2 border-slate-600 bg-white p-2 shadow-sm shadow-slate-500 transition-colors hover:cursor-pointer hover:bg-slate-100"
            onClick={handleParkingSpotsButton}
        >
            {popupOpen === "parking" ? (
                <ArrowRight size={32} color="#2e2e2e" />
            ) : (
                <CircleParkingOff size={32} color="#c95353" />
            )}
        </button>
    );
}

export default ParkingSpots;
