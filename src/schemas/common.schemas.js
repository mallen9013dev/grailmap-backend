export const envSchema = {
  type: "object",
  required: ["NODE_ENV", "FRONTEND_URL", "LOGGER_LEVEL", "PORT", "GOOGLE_MAPS_API_KEY"],
  properties: {
    NODE_ENV: { type: "string", enum: ["development", "production", "test"] },
    FRONTEND_URL: { type: "string" },
    FRONTEND_URL_LAN: { type: "string" },
    LOGGER_LEVEL: { type: "string", enum: ["trace", "debug", "info", "warn", "error", "fatal"], default: "info" },
    PORT: { type: "string", pattern: "^[0-9]+$", default: "3000" },
    GOOGLE_MAPS_API_KEY: { type: "string", minLength: 1 }
  },
  additionalProperties: false
}
