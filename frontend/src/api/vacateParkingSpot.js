import axios from "axios";

export const vacateParkingSpot = async (userId, parkingId) => {
    try {
        const response = await axios.post(
            `/api/park/vacay?user=${userId}&parking=${parkingId}`
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error marking parking spot as vacated:", error.response.data.error);
        throw error;
    }
};