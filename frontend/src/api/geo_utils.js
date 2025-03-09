import axios from "axios";

const API_BASE_URL = "http://localhost:8001"; // Change this when deploying

/**
 * Fetches all locations from the backend.
 * @returns An array of location objects or an empty array if an error occurs.
 */
export async function getAllLocations() {
    try {
        const response = await axios.get(`${API_BASE_URL}/locations/`);
        return response.data.locations; // Extract the list of locations
    } catch (error) {
        console.error("Error fetching locations:", error);
        return []; // Return an empty array if request fails
    }
}

/**
 * Fetches a specific location by its UCLA name.
 * Since FastAPI doesn't support querying by name directly, we filter after fetching all locations.
 * @param name - The name of the location.
 * @returns The matching location object or null if not found.
 */
export async function findLocationByName(name: string) {
    try {
        const locations = await getAllLocations();

        // Filter by name (case insensitive)
        const matchingLocation = locations.find(
            (loc: any) => loc.ucla_name.toLowerCase() === name.toLowerCase()
        );

        return matchingLocation || null;
    } catch (error) {
        console.error(`Error finding location by name "${name}":`, error);
        return null;
    }
}

/**
 * Gets the total number of locations.
 * @returns The total count of locations or 0 if an error occurs.
 */
export async function getTotalLocations() {
    try {
        const locations = await getAllLocations();
        return locations.length; // Return the count of locations
    } catch (error) {
        console.error("Error fetching total locations:", error);
        return 0;
    }
}

/**
 * Fetches a location by its index in the list (from 0 to total locations - 1).
 * @param index - The index of the location in the list.
 * @returns The location object or null if index is out of range.
 */
/**
 * Fetches a location by its index and extracts lat/lon into an object.
 * @param index - The index of the location in the list.
 * @returns The location object with parsed coordinates or null if index is out of range.
 */
export async function getLocationByIndex(index: number) {
    try {
        const locations = await getAllLocations();

        if (index < 0 || index >= locations.length) {
            console.error(`Index ${index} is out of range.`);
            return null; // Return null if index is out of bounds
        }

        const location = locations[index];

        // Extract lat and lon from string (assuming format is "lat: xx.xxx, lon: xx.xxx")
        const coordinates = location.coordinates.match(/lat:\s*(-?\d+\.\d+),\s*lon:\s*(-?\d+\.\d+)/);
        const parsedCoordinates = coordinates
            ? { lat: parseFloat(coordinates[1]), lon: parseFloat(coordinates[2]) }
            : null;

        return { ...location, parsedCoordinates };
    } catch (error) {
        console.error(`Error fetching location at index ${index}:`, error);
        return null;
    }
}

