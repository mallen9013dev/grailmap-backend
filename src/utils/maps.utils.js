import searchConstants from "../constants/search.constants.js"
import logger from "./logger.utils.js"

const parseAddress = (components) => {
  const address = {
    street: "N/A",
    city: "N/A",
    state: "N/A",
    zip: "N/A",
    country: "N/A"
  }

  let streetNumber = ""
  let route = ""

  // define preferred order for city-like components
  const cityPriority = ["locality", "postal_town", "administrative_area_level_3"]

  components.forEach((component) => {
    try {
      const value = (component.short_name || component.shortText || component.longText || "").trim()
      const types = component?.types ?? []

      // street and route components
      if (types.includes("street_number")) streetNumber = value
      if (types.includes("route")) route = value

      // city / town fallback logic
      for (const type of cityPriority) {
        if (types.includes(type) && address.city === "N/A") {
          address.city = value
          break // stop at the first matching priority
        }
      }

      // other components
      if (types.includes("administrative_area_level_1")) address.state = value
      if (types.includes("postal_code")) address.zip = value
      if (types.includes("country")) address.country = value
    } catch (err) {
      logger.error({ error: err, component }, "Unexpected error parsing address")
    }
  })

  // combine street number + route
  address.street = [streetNumber, route].filter(Boolean).join(" ") || "N/A"

  return address
}

const haversineDistanceMeters = (origin, destination) => {
  if (!origin || !destination) return null

  const toRadians = (deg) => (deg * Math.PI) / 180
  const dLat = toRadians(destination.lat - origin.lat)
  const dLng = toRadians(destination.lng - origin.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return searchConstants.DISTANCES.EARTH_RADIUS_METERS * c
}

const filterPlacesByDistance = (places, originCoords, maxDistanceMeters = searchConstants.DISTANCES.DEFAULT_MAX_DISTANCE_METERS) => {
  if (!Array.isArray(places)) return []
  if (!originCoords) {
    logger.warn({ origin }, "missing origin coordinates for distance filter")
    return places
  }

  return places.filter((place) => {
    const distance = haversineDistanceMeters(originCoords, place.coords)
    if (distance == null) return false
    return distance <= maxDistanceMeters
  })
}

export { parseAddress, haversineDistanceMeters, filterPlacesByDistance }
