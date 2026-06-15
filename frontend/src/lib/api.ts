const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string)                              => request<T>(path),
  post:   <T>(path: string, body: unknown)               => request<T>(path, { method: "POST",   body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)               => request<T>(path, { method: "PUT",    body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: <T>(path: string)                              => request<T>(path, { method: "DELETE" }),
};
