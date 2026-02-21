import cors from "@fastify/cors"
import Fastify from "fastify"
import fastifyEnv from "@fastify/env"
import fastifyRateLimit from "@fastify/rate-limit"
import helmet from "@fastify/helmet"
import { envSchema } from "./schemas/common.schemas.js"
import logger from "./utils/logger.utils.js"
import searchRoutes from "./routes/search.routes.js"

// CREATE FASTIFY INSTANCE
const fastify = Fastify({
  loggerInstance: logger,
  trustProxy: true
})

// REGISTER PLUGINS
await fastify.register(cors, {
  origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_LAN].filter(Boolean)
})

await fastify.register(fastifyRateLimit, {
  max: 300,
  timeWindow: "5 minutes"
})

await fastify.register(helmet, { global: true })

await fastify.register(searchRoutes)

// START SERVER
const port = process.env.PORT ?? 3000
fastify.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

const close = async () => {
  await fastify.close()
  process.exit(0)
}

process.on("SIGTERM", close)
process.on("SIGINT", close)
