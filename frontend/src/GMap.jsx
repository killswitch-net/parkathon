import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom component to handle map center updates
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 17);
        }
    }, [center, map]);
    return null;
}

function GMap({ currentLocation, cameraLocation, marker, parkingLocations }) {
    const initialCenter = { lat: 40.6401, lng: 22.9444 };
    const markerLocation =
        marker === "parking" ? currentLocation : cameraLocation;

    const parkingIcon = new L.Icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
    });

    return (
        <MapContainer
            center={initialCenter}
            zoom={13}
            style={{ width: "100vw", height: "100vh" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={markerLocation} />

            {markerLocation && <Marker position={markerLocation} />}

            {marker === "destination" &&
                parkingLocations.map((location, index) => (
                    <Marker
                        key={index}
                        position={location}
                        icon={parkingIcon}
                    />
                ))}
        </MapContainer>
    );
}

export default GMap;
