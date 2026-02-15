import { generateDirectionsUrl, geocodeLocation, reverseGeocodeLocation, textSearchPlaces } from "../clients/maps.client.js"
import searchConstants from "../constants/search.constants.js"
import logger from "../utils/logger.utils.js"

/**
 * Create a Google Maps directions URL from ordered places.
 * @param {Array<{ lat:number, lng:number }>} placesToNavigate
 * @returns {Promise<{ success:boolean, directionsUrl?:string, statusCode?:number, message?:string }>}
 */
const createDirectionsUrl = async (placesToNavigate) => {
  logger.info({ placesToNavigate }, "creating directions URL")

  const directionsResult = generateDirectionsUrl(placesToNavigate)

  if (!directionsResult.success) {
    return {
      success: false,
      statusCode: directionsResult.statusCode,
      message: directionsResult.message
    }
  }

  logger.info({ directionsUrl: directionsResult.directionsUrl }, "successfully created directions URL")

  return {
    success: true,
    directionsUrl: directionsResult.directionsUrl
  }
}

/**
 * Retrieve supported search options.
 * @returns {Promise<{ success:true, searchOptions:Array }>}
 */
const getSearchOptions = async () => {
  logger.info("Successfully retrieved search options")

  // Map the options to only include id, label, category
  const searchOptions = searchConstants.SEARCH_OPTIONS.map(({ id, label, category }) => ({ id, label })).sort((a, b) => {
    if (a.label < b.label) return -1
    if (a.label > b.label) return 1
    return 0
  })

  return {
    success: true,
    searchOptions
  }
}

/**
 * Search for locations near an origin.
 * If coords exist it will reverse geocode, otherwise forward geocode from text query.
 *  @param {{
 *   location: { coords?: { lat:number, lng:number }, query?: string},
 *   searchOptionId?: string
 * }} input
 *
 * @returns {Promise<{ success:boolean, startingLocation?:object, locations?:Array, statusCode?:number, message?:string}>}
 */
const searchForLocations = async (input) => {
  logger.info(input, "searching for locations")

  let originCoords = input.location?.coords
  let originLocation

  // Determine origin location
  if (!originCoords) {
    if (!input.location?.query) {
      return {
        success: false,
        statusCode: 400,
        message: "Location query or coordinates are required"
      }
    }

    const geocodeResult = await geocodeLocation(input.location.query)

    if (!geocodeResult.success) {
      return {
        success: false,
        statusCode: geocodeResult.statusCode,
        message: geocodeResult.message
      }
    }

    originLocation = geocodeResult.location
    originCoords = geocodeResult.location.coordinates

    logger.info({ query: input.location.query, originLocation }, "successfully geocoded origin")
  } else {
    const reverseGeocodeResult = await reverseGeocodeLocation(originCoords.lat, originCoords.lng)

    if (!reverseGeocodeResult.success) {
      return {
        success: false,
        statusCode: reverseGeocodeResult.statusCode,
        message: reverseGeocodeResult.message
      }
    }

    originLocation = reverseGeocodeResult.location

    logger.info({ coords: originCoords, originLocation }, "successfully reverse geocoded origin")
  }

  // Places search
  const textQuerySearch = searchConstants.SEARCH_OPTIONS.find((searchOption) => searchOption.id === input.searchOptionId)
  if (!textQuerySearch) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid search option ID"
    }
  }

  const placesResult = await textSearchPlaces(originCoords, textQuerySearch.query)

  // Log and Return Results
  if (!placesResult.success) {
    return {
      success: false,
      statusCode: placesResult.statusCode,
      message: placesResult.message
    }
  }

  logger.info(
    {
      foundCount: placesResult.locations.length,
      places: placesResult.locations.map(({ id, name }) => ({ id, name }))
    },
    "successfully found locations"
  )

  return {
    success: true,
    originLocation,
    locations: placesResult.locations
  }
}

export { createDirectionsUrl, getSearchOptions, searchForLocations }
