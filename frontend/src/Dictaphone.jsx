import "regenerator-runtime/runtime";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, MicOff } from "lucide-react";
import { getTranscriptLocation } from "./api/getTranscriptLocation";
import { getParkingLocations } from "./api/getParkingLocations";
import { formatCoordinates } from "./utils/formatCoordinates";

function Dictaphone({
    getLocationFromDestination,
    setCameraLocation,
    setParkingLocations,
    setMarker,
    radius,
    setMessage,
}) {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const handleMicButton = async () => {
        if (!browserSupportsSpeechRecognition) {
            alert("Your browser does not support speech recognition.");
            return;
        }
        if (listening) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            console.log("Final transcript:", transcript);
            SpeechRecognition.stopListening();
            try {
                const destination = await getTranscriptLocation(transcript);
                const location = await getLocationFromDestination(destination);
                console.log("Found location:", location);
                setMessage(`Navigating to ${destination}`);
                setCameraLocation(location);

                try {
                    let parkingLocations = await getParkingLocations(
                        location.lat,
                        location.lng,
                        radius,
                    );
                    parkingLocations = formatCoordinates(parkingLocations);
                    setParkingLocations(parkingLocations);
                    setMarker("destination");
                } catch (error) {
                    console.error("Error getting parking locations:", error);
                }
            } catch (error) {
                console.error("Error getting location from transcript:", error);
            }
        } else {
            resetTranscript();
            SpeechRecognition.startListening({
                language: "el-GR",
                continuous: true,
            });
        }
    };

    return (
        <button
            className="flex items-center gap-2 rounded-xl border-2 border-slate-600 p-4 transition-colors hover:cursor-pointer hover:bg-slate-100"
            onClick={handleMicButton}
        >
            {listening ? (
                <Mic size={32} color="#427ab3" />
            ) : (
                <MicOff size={32} color="#2e2e2e" />
            )}
        </button>
    );
}

export default Dictaphone;
