export const getCityFromCoordinates = async (lat, lon) => {
  const API_KEY = '0d82ae05ef3d8cb7ca590c3211c33f75';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results.length > 0) {
      // Example path to city: data.results[0].components.city or town or village
      const components = data.results[0].components;
      return (
        components.city ||
        components.town ||
        components.village ||
        components.county ||
        'Unknown'
      );
    }
    return 'Unknown';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown';
  }
};
