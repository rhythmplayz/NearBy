const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ROLE_KEY = 'tokenRole';

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
};

export const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const segments = token.split('.');
    if (segments.length !== 3) {
      return null;
    }

    return JSON.parse(base64UrlDecode(segments[1]));
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const storeAuthSession = ({ accessToken, refreshToken, role }) => {
  if (!accessToken) {
    clearAuthSession();
    return;
  }

  localStorage.setItem(TOKEN_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }
};

export const getValidStoredToken = (expectedRole = null) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp || Date.now() >= payload.exp * 1000) {
    clearAuthSession();
    return null;
  }

  const storedRole = localStorage.getItem(ROLE_KEY);
  if (expectedRole) {
    if (payload.user_type && payload.user_type !== expectedRole) {
      clearAuthSession();
      return null;
    }

    if (storedRole && storedRole !== expectedRole) {
      clearAuthSession();
      return null;
    }

    if (!payload.user_type && !storedRole) {
      clearAuthSession();
      return null;
    }
  }

  return token;
};
