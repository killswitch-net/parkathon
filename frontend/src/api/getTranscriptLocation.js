import axios from "axios";

export const getTranscriptLocation = async (transcript) => {
    try {
        const response = await axios.get(
            `http://${import.meta.env.MY_HOST}:9000/transcript?text=${transcript}`
        );
        console.log(response.data);
        return response.data.location;
    } catch (error) {
        console.error("Error getting location from transcript:", error.response.data.error);
        throw error;
    }
};