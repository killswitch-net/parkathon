import axios from "axios";

export const getParkingLocations = async (lat, lon, rad) => {
    try {
        const response = await axios.get(
            `http://${import.meta.env.MY_HOST}:9000/park/find?lat=${lat}&lon=${lon}&rad=${rad}`
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting parking locations:", error.response.data.error);
        throw error;
    }
};
