import type { ErrorHandler } from "elysia"

export const handleError: ErrorHandler = ({ code, error }) => {
  // TODO:: log the error message once we create the global plugin.
  switch (code) {
    case "UNKNOWN":
      return { type: "unknown", message: "Unable to process request." };
    case "VALIDATION":
      return error.detail(error.message)
  }
}
