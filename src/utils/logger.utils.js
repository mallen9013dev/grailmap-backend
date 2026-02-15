import "dotenv/config"
import pino from "pino"

const isDev = process.env.NODE_ENV === "development"
const loggerLevel = process.env.LOGGER_LEVEL
console.log(loggerLevel)

const logger = pino(
  isDev
    ? {
        level: loggerLevel,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "reqId, pid, hostname"
          }
        }
      }
    : {
        level: loggerLevel,
        timestamp: pino.stdTimeFunctions.isoTime
      }
)

export default logger
