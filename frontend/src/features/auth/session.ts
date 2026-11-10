import { useSessionValidator } from "./hooks/useSessionValidator";

/** Keeps the Redux session in sync with the stored token. Renders nothing. */
export function SessionValidator() {
  useSessionValidator();
  return null;
}
