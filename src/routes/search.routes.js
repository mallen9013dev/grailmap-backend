import { createDirectionsUrlSchema, searchForLocationsSchema } from "../schemas/search.schemas.js"
import { searchForLocations, createDirectionsUrl, getSearchOptions } from "../services/search.service.js"

const searchRoutes = async (fastify) => {
  // CREATE DIRECTIONS URL
  fastify.post(
    "/create-directions-url",
    {
      schema: createDirectionsUrlSchema
    },
    async (request, reply) => {
      try {
        const directionsUrlResult = await createDirectionsUrl(request.body)
        const statusCode = directionsUrlResult.success ? 200 : directionsUrlResult.statusCode || 500
        reply.status(statusCode).send(directionsUrlResult)
      } catch (err) {
        fastify.log.error(err, "Error in /create-directions-url")
        reply.status(500).send({ success: false, error: "Internal server error" })
      }
    }
  )

  // SEARCH FOR LOCATIONS
  fastify.post(
    "/search",
    {
      schema: searchForLocationsSchema,
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      try {
        const locationsResult = await searchForLocations(request.body)
        const statusCode = locationsResult.success ? 200 : locationsResult.statusCode || 500
        reply.status(statusCode).send(locationsResult)
      } catch (err) {
        fastify.log.error(err, "Error in /search")
        reply.status(500).send({ success: false, error: "Internal server error" })
      }
    }
  )

  // GET SEARCH OPTIONS
  fastify.get("/search-options", async (request, reply) => {
    try {
      const searchOptionsResult = await getSearchOptions(request.query)
      const statusCode = searchOptionsResult.success ? 200 : searchOptionsResult.statusCode || 500
      reply.status(statusCode).send(searchOptionsResult)
    } catch (err) {
      fastify.log.error(err, "Error in /search-options")
      reply.status(500).send({ success: false, error: "Internal server error" })
    }
  })
}

export default searchRoutes
