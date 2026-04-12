type ViteImportMeta = ImportMeta & {
	env?: {
		VITE_API_BASE_URL?: string;
	};
};

const envApiBaseUrl = (import.meta as ViteImportMeta).env?.VITE_API_BASE_URL?.trim();
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// Fallback: use the same host where the frontend is opened and backend on port 8080.
const fallbackApiBaseUrl = `http://${runtimeHost}:8080/api`;

export const API_BASE_URL = envApiBaseUrl || fallbackApiBaseUrl;
export const API_STATS_URL = `${API_BASE_URL}/Stats`;
export const API_TRANSACTION_URL = `${API_BASE_URL}/Transaction`;
