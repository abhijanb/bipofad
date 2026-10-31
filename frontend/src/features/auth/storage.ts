const ACCESS_KEY = "hbc.auth.token";
const REFRESH_KEY = "hbc.auth.refresh";

export function loadToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string) {
  window.localStorage.setItem(ACCESS_KEY, token);
}

export function forgetToken() {
  window.localStorage.removeItem(ACCESS_KEY);
}

export function loadRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function saveRefreshToken(token: string) {
  window.localStorage.setItem(REFRESH_KEY, token);
}

export function forgetRefreshToken() {
  window.localStorage.removeItem(REFRESH_KEY);
}

export function clearTokens() {
  forgetToken();
  forgetRefreshToken();
}
