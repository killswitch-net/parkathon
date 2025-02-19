import GMap from "./GMap";
import Footer from "./Footer";
import Options from "./Options";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ParkingSpots from "./ParkingSpots";
import Popup from "./Popup";

function App() {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [cameraLocation, setCameraLocation] = useState(null);
    const [marker, setMarker] = useState(null);
    const [userId, setUserId] = useState(null);
    const [parkingLocations, setParkingLocations] = useState([]);
    const [popupOpen, setPopupOpen] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeParkingSpots, setActiveParkingSpots] = useState([]);
    const [radius, setRadius] = useState(50);

    return (
        <main className="relative h-screen">
            <ParkingSpots
                userId={userId}
                popupOpen={popupOpen}
                setPopupOpen={setPopupOpen}
                setIsLoading={setIsLoading}
                setActiveParkingSpots={setActiveParkingSpots}
            />
            <Options setPopupOpen={setPopupOpen} popupOpen={popupOpen} />
            <Popup
                popupOpen={popupOpen}
                isLoading={isLoading}
                activeParkingSpots={activeParkingSpots}
                setActiveParkingSpots={setActiveParkingSpots}
                userId={userId}
                setRadius={setRadius}
            />
            <GMap
                currentLocation={currentLocation}
                cameraLocation={cameraLocation}
                marker={marker}
                parkingLocations={parkingLocations}
            />
            <Footer
                setCurrentLocation={setCurrentLocation}
                userId={userId}
                setCameraLocation={setCameraLocation}
                setMarker={setMarker}
                setParkingLocations={setParkingLocations}
                setUserId={setUserId}
                radius={radius}
            />
        </main>
    );
}

export default App;
