const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper for calling backend API
 * @param {string} endpoint - API endpoint (e.g., '/rooms', '/bookings')
 * @param {object} options - fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - parsed JSON response
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ===== HTTP Method Helpers =====

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),

    post: (endpoint, data) =>
        request(endpoint, { method: 'POST', body: JSON.stringify(data) }),

    put: (endpoint, data) =>
        request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),

    patch: (endpoint, data) =>
        request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;
