import axios from "axios"
import GOOGLE_API_BASE_URLS from "../constants/google.constants.js"
import logger from "../utils/logger.utils.js"
import { filterPlacesByDistance, haversineDistanceMeters, parseAddress } from "../utils/maps.utils.js"

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY

/**
 * Forward geocode a text query into coordinates + address.
 * @param {string} query
 * @returns {Promise<{ success:boolean, location?:object, statusCode?:number, message?:string }>}
 */
const geocodeLocation = async (query) => {
  if (!query) {
    return { success: false, statusCode: 400, message: "Location query is required" }
  }

  const url = `${GOOGLE_API_BASE_URLS.MAPS_API_BASE_URL}/geocode/json`

  try {
    const resp = await axios.get(url, {
      params: { address: query, key: GOOGLE_API_KEY }
    })

    const results = resp.data?.results
    if (!results?.length) {
      return { success: false, statusCode: 404, message: "No location found. Please search again." }
    }

    const { lat, lng } = results[0].geometry.location
    const parsedAddress = parseAddress(results[0].address_components)

    return {
      success: true,
      location: {
        address: parsedAddress,
        coordinates: { lat, lng }
      }
    }
  } catch (err) {
    logger.error({ error: err, googleMessage: err?.response?.data?.error?.message }, "error geocoding location")

    return {
      success: false,
      statusCode: err.response?.status || 500,
      message: "Unexpected error finding location. Please try again."
    }
  }
}

/**
 * Reverse geocode coordinates into a human-readable address.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ success:boolean, location?:object, statusCode?:number, message?:string }>}
 */
const reverseGeocodeLocation = async (lat, lng) => {
  if (lat == null || lng == null) {
    return { success: false, statusCode: 400, message: "Latitude and longitude are required" }
  }

  const url = `${GOOGLE_API_BASE_URLS.MAPS_API_BASE_URL}/geocode/json`

  try {
    const resp = await axios.get(url, {
      params: { latlng: `${lat},${lng}`, key: GOOGLE_API_KEY }
    })

    const results = resp.data?.results
    if (!results?.length) {
      return { success: false, statusCode: 404, message: "No location found. Please search again." }
    }

    return {
      success: true,
      location: {
        address: parseAddress(results[0].address_components),
        coordinates: { lat, lng }
      }
    }
  } catch (err) {
    logger.error({ error: err, googleMessage: err?.response?.data?.error?.message }, "error reverse geocoding location")

    return {
      success: false,
      statusCode: err.response?.status || 500,
      message: "Unexpected error finding location. Please try again."
    }
  }
}

/**
 * Generate a Google Maps directions URL.
 * @param {Array<{ id:string, name:string }>} placesToNavigate
 * @returns {{ success:boolean, directionsUrl?:string, statusCode?:number, message?:string }}
 */
const generateDirectionsUrl = (placesToNavigate) => {
  try {
    if (!Array.isArray(placesToNavigate)) {
      return { success: false, statusCode: 400, message: "At least two places are required" }
    }

    const destination = placesToNavigate.at(-1)
    const waypoints = placesToNavigate.slice(0, -1)

    let url = GOOGLE_API_BASE_URLS.DIRECTIONS_BASE_URL
    url += `&destination=${encodeURIComponent(destination.name)}`
    url += `&destination_place_id=${encodeURIComponent(`place_id:${destination.id}`)}`

    if (waypoints.length) {
      url += `&waypoints=${waypoints.map((p) => encodeURIComponent(p.name)).join("%7C")}`
      url += `&waypoint_place_ids=${waypoints.map((p) => encodeURIComponent(`place_id:${p.id}`)).join("%7C")}`
    }

    return { success: true, directionsUrl: url }
  } catch (err) {
    logger.error({ error: err }, "error generating directions URL")
    return {
      success: false,
      statusCode: 500,
      message: "Unexpected error generating directions URL. Please try again."
    }
  }
}

/**
 * Text-search nearby places using Google Places API.
 * @param {{ lat:number, lng:number }} originCoords
 * @param {string} query
 * @returns {Promise<{ success:boolean, places?:Array, statusCode?:number, message?:string }>}
 */
const textSearchPlaces = async (originCoords, query) => {
  if (!originCoords || !query) {
    return { success: false, statusCode: 400, message: "Coordinates and search query are required" }
  }

  const url = `${GOOGLE_API_BASE_URLS.PLACES_API_BASE_URL}/places:searchText`

  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: {
          latitude: originCoords.lat,
          longitude: originCoords.lng
        }
      }
    },
    maxResultCount: 20,
    rankPreference: "DISTANCE" // "DISTANCE" or "RELEVANCE"
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": GOOGLE_API_KEY,
    "X-Goog-FieldMask": "places.id,places.displayName,places.addressComponents,places.googleMapsLinks,places.location"
  }

  try {
    const resp = await axios.post(url, body, { headers })

    const locations = resp.data?.places?.map((place) => {
      const locationCoords = { lat: place.location.latitude, lng: place.location.longitude }
      return {
        id: place.id,
        name: place.displayName.text,
        address: parseAddress(place.addressComponents),
        distanceMeters: haversineDistanceMeters(originCoords, locationCoords),
        coords: locationCoords,
        placesLink: place.googleMapsLinks.placeUri
      }
    })

    const filteredLocations = filterPlacesByDistance(locations, originCoords)

    return {
      success: true,
      locations: filteredLocations
    }
  } catch (err) {
    logger.error({ error: err, googleMessage: err?.response?.data?.error?.message }, "error searching nearby places")
    return {
      success: false,
      statusCode: err.response?.status || 500,
      message: "Unexpected error searching for nearby places. Please try again."
    }
  }
}

export { geocodeLocation, reverseGeocodeLocation, textSearchPlaces, generateDirectionsUrl }
