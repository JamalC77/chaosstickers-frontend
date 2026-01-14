// Authentication utilities for creator platform

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL || '';

export interface Creator {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  storeName: string;
  isVerified: boolean;
  createdAt: string;
}

// Session token management
export const getSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('creatorSessionToken');
};

export const setSessionToken = (token: string): void => {
  localStorage.setItem('creatorSessionToken', token);
};

export const clearSessionToken = (): void => {
  localStorage.removeItem('creatorSessionToken');
  localStorage.removeItem('creatorData');
};

// Creator data management
export const getStoredCreator = (): Creator | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('creatorData');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredCreator = (creator: Creator): void => {
  localStorage.setItem('creatorData', JSON.stringify(creator));
};

// API calls
export const requestMagicLink = async (email: string): Promise<{ success: boolean; isNewCreator: boolean }> => {
  const response = await fetch(`${API_BASE}/api/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send magic link');
  }

  return response.json();
};

export const verifyMagicLink = async (
  email: string,
  token: string
): Promise<{ creator: Creator; sessionToken: string }> => {
  const response = await fetch(
    `${API_BASE}/api/auth/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Verification failed');
  }

  const data = await response.json();
  return { creator: data.creator, sessionToken: data.sessionToken };
};

export const getCurrentCreator = async (): Promise<Creator | null> => {
  const token = getSessionToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearSessionToken();
        return null;
      }
      throw new Error('Failed to get creator info');
    }

    const data = await response.json();
    setStoredCreator(data.creator);
    return data.creator;
  } catch (error) {
    console.error('Error getting current creator:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  const token = getSessionToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  clearSessionToken();
};

export const checkStoreName = async (storeName: string): Promise<{ available: boolean; error?: string }> => {
  const response = await fetch(
    `${API_BASE}/api/auth/check-store-name?storeName=${encodeURIComponent(storeName)}`
  );

  return response.json();
};

// Authenticated fetch helper
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getSessionToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, {
    ...options,
    headers,
  });
};
