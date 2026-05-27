const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

export const locationService = {
  search: async (query) => {
    const q = encodeURIComponent(query);
    const response = await fetch(`${NOMINATIM_URL}/search?format=json&q=${q}&addressdetails=1&limit=5`);
    return response.json();
  },
  reverseGeocode: async (lat, lng) => {
    const response = await fetch(`${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
    return response.json();
  },
};
