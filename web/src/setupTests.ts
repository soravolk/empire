// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Set environment variables for testing
process.env.REACT_APP_API_URL = "http://localhost:3001";

// Polyfill for TextEncoder/TextDecoder and Web Streams required by MSW
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, TransformStream } from "stream/web";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;
global.TransformStream = TransformStream as any;

// Suppress act() warnings for user-event interactions
// This is a known issue with React 18 and @testing-library/user-event
// where synchronous state updates trigger warnings even when properly awaited
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to") &&
      args[0].includes("was not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
