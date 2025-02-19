import axios from "axios";

export const getTranscriptLocation = async (transcript) => {
    try {
        const response = await axios.get(
            `/api/transcript?text=${transcript}`
        );
        console.log(response.data);
        return response.data.location;
    } catch (error) {
        console.error("Error getting location from transcript:", error.response.data.error);
        throw error;
    }
};