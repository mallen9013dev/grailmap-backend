const createDirectionsUrlSchema = {
  body: {
    type: "array",
    minItems: 1,
    items: {
      type: "object",
      required: ["name", "id"],
      properties: {
        name: { type: "string", minLength: 1 },
        id: { type: "string", minLength: 1 }
      },
      additionalProperties: false
    }
  }
}

const searchForLocationsSchema = {
  body: {
    type: "object",
    required: ["location", "searchOptionId"],
    properties: {
      location: {
        type: "object",
        properties: {
          query: { type: "string" },
          coords: {
            type: ["object", "null"],
            required: ["lat", "lng"],
            properties: {
              lat: { type: "number" },
              lng: { type: "number" }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      },
      searchOptionId: { type: "string" }
    },
    additionalProperties: false
  }
}

export { createDirectionsUrlSchema, searchForLocationsSchema }
