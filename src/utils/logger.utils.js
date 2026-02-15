import "dotenv/config"
import pino from "pino"

const isDev = process.env.NODE_ENV === "development"
const loggerLevel = process.env.loggerLevel

const logger = pino(
  isDev
    ? {
        // DEV SETTINGS
        transport: {
          target: "pino-pretty",
          level: loggerLevel,
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "reqId, pid, hostname"
          }
        }
      }
    : // PROD SETTINGS
      {
        level: loggerLevel,
        timestamp: pino.stdTimeFunctions.isoTime
      }
)

export default logger
