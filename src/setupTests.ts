// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for Jest environment
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Set up required environment variables for tests
process.env.REACT_APP_AUTH0_DOMAIN = "test-domain.auth0.com";
process.env.REACT_APP_AUTH0_CLIENT_ID = "test-client-id";
process.env.REACT_APP_AUTH0_AUDIENCE = "test-audience";
process.env.REACT_APP_API_BASE_URL = "http://localhost:8080";
process.env.REACT_APP_USE_MOCK_DATA = "true";

// Suppress act() warnings - we're properly handling async with waitFor
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("An update to") &&
      args[0].includes("inside a test was not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
