import { vacateParkingSpot } from "./api/vacateParkingSpot";
import CircularProgress from "@mui/material/CircularProgress";
import { X } from "lucide-react";

function Popup({
    popupOpen,
    isLoading,
    setActiveParkingSpots,
    activeParkingSpots,
    userId,
    setRadius,
}) {
    const handleDeleteParkingSpot = async (parkingId) => {
        try {
            await vacateParkingSpot(userId, parkingId);
            setActiveParkingSpots((prevSpots) =>
                prevSpots.filter((spot) => spot.parking_id !== parkingId),
            );
        } catch (error) {
            console.error("Error deleting parking spot:", error);
        }
    };

    if (!popupOpen) {
        return null;
    }

    return (
        <div className="fixed top-4 right-20 z-999 flex flex-col gap-4 rounded-xl border-2 border-slate-600 bg-white p-4 shadow-sm shadow-slate-500">
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <CircularProgress size={32} />
                    <h3 className="">Loading</h3>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-6">
                        <h2 className="text-lg font-bold">
                            {popupOpen === "parking" &&
                                activeParkingSpots.length === 0 &&
                                "No active parking spots"}
                            {popupOpen === "parking" &&
                                activeParkingSpots.length !== 0 &&
                                "Active Parking Spots"}
                            {popupOpen === "options" && "Radius"}
                        </h2>
                    </div>
                    {(activeParkingSpots.length !== 0 ||
                        popupOpen === "options") && (
                        <hr className="h-px w-full bg-slate-300" />
                    )}
                    {popupOpen === "options" ? (
                        <input
                            type="number"
                            className="w-16 [appearance:textfield] rounded-md border-2 border-slate-600 px-2 py-1.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            defaultValue={50}
                            onChange={(e) => {
                                setRadius(e.target.value);
                            }}
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            {activeParkingSpots.map((spot, index) => (
                                <div
                                    key={spot.parking_id}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <h3 className="text-lg text-gray-800">
                                        {`${index + 1}. ${spot.name}`}
                                    </h3>
                                    <button
                                        className="rounded-full border-2 border-slate-600 p-1 transition-colors hover:cursor-pointer hover:bg-slate-100"
                                        onClick={() =>
                                            handleDeleteParkingSpot(
                                                spot.parking_id,
                                            )
                                        }
                                    >
                                        <X size={24} color="#c95353" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Popup;
