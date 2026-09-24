const rawApiUrl = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'https://campustuck-backend.onrender.com'
).replace(/\/+$/, '');

export const API_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl}/api`;

const TOKEN_STORAGE_KEY = 'campustuck_auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
}

let cachedCsrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

/**
 * Safely parse JSON responses.
 */
async function parseResponse(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

/**
 * Get a CSRF token from backend.
 */
async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    cachedCsrfToken = null;
  }

  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  // Prevent multiple simultaneous CSRF requests
  if (csrfRequest) {
    return csrfRequest;
  }

  csrfRequest = (async () => {
    try {
      const response = await fetch(`${API_URL}/config/csrf`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || 'Unable to obtain CSRF token'
        );
      }

      if (!data?.csrfToken || typeof data.csrfToken !== 'string') {
        throw new Error('CSRF token was not returned by server');
      }

      cachedCsrfToken = data.csrfToken;
      return data.csrfToken;
    } catch (err: any) {
      console.warn('[CSRF] Could not obtain CSRF token:', err.message);
      return '';
    }
  })();

  try {
    return await csrfRequest;
  } finally {
    csrfRequest = null;
  }
}

/**
 * Check whether HTTP method changes server state.
 */
function isMutatingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * Main API request function.
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${
    endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }`;

  const method = (options.method || 'GET').toUpperCase();

  /**
   * Execute request.
   */
  const makeRequest = async (
    forceNewCsrfToken = false
  ): Promise<{
    response: Response;
    data: any;
  }> => {
    const headers = new Headers(options.headers || {});

    headers.set('Accept', 'application/json');

    // Attach Bearer token from localStorage for reliable cross-domain authentication
    const token = getAuthToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    /*
     * Only set JSON content type when a request actually
     * contains a body.
     */
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json');
    }

    /*
     * POST / PUT / PATCH / DELETE require CSRF token when not using Bearer auth.
     */
    if (isMutatingMethod(method) && !headers.has('Authorization')) {
      const csrfToken = await getCsrfToken(forceNewCsrfToken);
      if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: 'include',
      });

      const data = await parseResponse(response);

      return {
        response,
        data,
      };
    } catch (networkError: any) {
      if (
        networkError.name === 'TypeError' ||
        networkError.message?.toLowerCase().includes('failed to fetch')
      ) {
        throw new Error(
          'Unable to reach CampusTuck server. If the server was idle, Render takes ~30-60 seconds to wake up. Please wait a moment and retry.'
        );
      }
      throw networkError;
    }
  };

  /*
   * First request.
   */
  let { response, data } = await makeRequest(false);

  /*
   * If CSRF token became stale/invalid,
   * obtain a fresh token and retry ONCE.
   */
  const errorMessage = String(
    data?.error || data?.message || ''
  ).toLowerCase();

  if (
    response.status === 403 &&
    isMutatingMethod(method) &&
    errorMessage.includes('csrf')
  ) {
    cachedCsrfToken = null;
    const retry = await makeRequest(true);
    response = retry.response;
    data = retry.data;
  }

  /*
   * Handle API errors.
   */
  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`;

    const error: Error & {
      status?: number;
      details?: any;
    } = new Error(message);

    error.status = response.status;
    error.details = data?.details;

    throw error;
  }

  return data as T;
}

/**
 * Authentication
 */
export const authAPI = {
  login: async (data: any) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  register: async (data: any) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
      cachedCsrfToken = null;
    }
    return { success: true };
  },

  me: async () => {
    try {
      return await fetchApi('/auth/me');
    } catch (err: any) {
      if (err.status === 401) {
        setAuthToken(null);
      }
      throw err;
    }
  },

  updateProfile: (data: any) =>
    fetchApi('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

/**
 * Products
 */
export const productsAPI = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });

    const queryString = query.toString();

    return fetchApi(
      queryString ? `/products?${queryString}` : '/products'
    );
  },

  getBySlug: (slug: string) =>
    fetchApi(`/products/${encodeURIComponent(slug)}`),

  create: (data: any) =>
    fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adjustStock: (id: string, data: any) =>
    fetchApi(`/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleActive: (id: string) =>
    fetchApi(`/products/${id}/toggle-active`, {
      method: 'PATCH',
    }),
};

/**
 * Categories
 */
export const categoriesAPI = {
  getAll: () => fetchApi('/categories'),

  getAllAdmin: () => fetchApi('/categories/admin/all'),

  create: (data: any) =>
    fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

/**
 * Cart
 */
export const cartAPI = {
  get: () => fetchApi('/cart'),

  updateItem: (productId: string, quantity: number) =>
    fetchApi('/cart/item', {
      method: 'PUT',
      body: JSON.stringify({
        productId,
        quantity,
      }),
    }),

  merge: (
    items: {
      productId: string;
      quantity: number;
    }[]
  ) =>
    fetchApi('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({
        items,
      }),
    }),

  clear: () =>
    fetchApi('/cart', {
      method: 'DELETE',
    }),
};

/**
 * Orders
 */
export const ordersAPI = {
  checkout: (data: any) =>
    fetchApi('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyOrders: () => fetchApi('/orders/my'),

  getById: (id: string) => fetchApi(`/orders/${id}`),

  cancel: (id: string, reason?: string) =>
    fetchApi(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        reason,
      }),
    }),
};

/**
 * Admin
 */
export const adminAPI = {
  getMetrics: () => fetchApi('/admin/metrics'),

  getOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });

    const queryString = query.toString();

    return fetchApi(
      queryString ? `/admin/orders?${queryString}` : '/admin/orders'
    );
  },

  updateOrderStatus: (id: string, status: string, note?: string) =>
    fetchApi(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        note,
      }),
    }),

  updatePaymentStatus: (id: string, status: string, note?: string) =>
    fetchApi(`/admin/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        note,
      }),
    }),

  getInventoryAudit: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });

    const queryString = query.toString();

    return fetchApi(
      queryString ? `/admin/inventory/audit?${queryString}` : '/admin/inventory/audit'
    );
  },

  getStaffUsers: () => fetchApi('/admin/users'),

  createStaffUser: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    department?: string;
  }) =>
    fetchApi('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteStaffUser: (id: string) =>
    fetchApi(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Configuration
 */
export const configAPI = {
  getCampus: () => fetchApi('/config/campus'),
  getCsrf: () => getCsrfToken(true),
};
