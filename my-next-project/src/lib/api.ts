const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401 || response.status === 422) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect to login if currently on an admin dashboard route
        const pathname = window.location.pathname;
        if (pathname.includes('/admin')) {
          if (pathname.startsWith('/developer')) {
            window.location.href = '/developer/login';
          } else {
            window.location.href = '/login';
          }
        }
      }
      throw new Error('Session expired or unauthorized.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || errorData.msg || 'API request failed');
  }
  return response.json();
}

function handleError(err: any) {
  if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
    throw new Error('Connection failed. Please check if the server is running.');
  }
  throw err;
}

export const api = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const isFormData = data instanceof FormData;
      const headers = getAuthHeaders();
      if (isFormData) {
        delete headers['Content-Type'];
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const isFormData = data instanceof FormData;
      const headers = getAuthHeaders();
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },

  delete: async (endpoint: string, data?: any) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },
};
