// Environment configuration for the 4x4 Builder app
// Adapted from Next.js pattern for Vite

const createEnv = () => {
  // Get environment variables with defaults
  const VITE_FASTAPI_BASE_URL =
    import.meta.env.VITE_FASTAPI_BASE_URL || "http://127.0.0.1:8000";
  const VITE_APP_NAME = "agent";

  // Validate required URLs
  try {
    new URL(VITE_FASTAPI_BASE_URL);
  } catch (error) {
    throw new Error(`Invalid VITE_FASTAPI_BASE_URL: ${VITE_FASTAPI_BASE_URL}`);
  }

  return {
    FASTAPI_BASE_URL: "http://0.0.0.0:8080",
    APP_NAME: VITE_APP_NAME,
  };
};

export const env = createEnv();
