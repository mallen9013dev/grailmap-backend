import cors from "@fastify/cors"
import Fastify from "fastify"
import fastifyEnv from "@fastify/env"
import fastifyRateLimit from "@fastify/rate-limit"
import helmet from "@fastify/helmet"
import { envSchema } from "./schemas/common.schemas.js"
import logger from "./utils/logger.utils.js"
import searchRoutes from "./routes/search.routes.js"

// CREATE FASTIFY INSTANCE
const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? "", 10)
const trustProxy = Number.isFinite(trustProxyHops) ? trustProxyHops : false
const fastify = Fastify({
  loggerInstance: logger,
  trustProxy
})

// REGISTER PLUGINS
await fastify.register(cors, {
  origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_LAN].filter(Boolean)
})

const rateLimitMax = Number.parseInt(process.env.RATE_LIMIT_MAX ?? "", 10) || 10
const rateLimitWindow = process.env.RATE_LIMIT_WINDOW ?? "1 minute"
await fastify.register(fastifyRateLimit, {
  max: rateLimitMax,
  timeWindow: rateLimitWindow,
  keyGenerator: (request) => {
    const clientIp = request.headers["x-real-ip"] || request.ip
    return `${clientIp}:${request.routerPath}`
  }
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
