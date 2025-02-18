import axios from "axios";

// Send parking location to backend
export const occupyPark = async (userId, lat, lon) => {
    try {
        const response = await axios.post(
            `http://${import.meta.env.MY_HOST}:9000/park/occupy?user=${userId}&lat=${lat}&lon=${lon}`,
        );
        console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "Error sending parking location:",
            error.response.data.error,
        );
        throw error;
    }
};
