const axios = require('axios');
const HttpError = require('../helpers/http-error');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

const API_KEY = process.env.GOOGLE_API_KEY;
async function getCoordsOfAddress(address) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        throw new HttpError('Could not find location coordinates', 404);
    }

    const coordinates = data.results[0].geometry.location;
    return coordinates;
};

module.exports = getCoordsOfAddress;