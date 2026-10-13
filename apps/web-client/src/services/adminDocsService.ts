import { getAuthHeaders } from './adminAuth';

const API_URL = import.meta.env.VITE_API_URL;

export interface AdminDoc {
  id: string;
  title: string;
  content: string;
}

export async function loadRemoteDocs(token: string | null): Promise<AdminDoc[] | null> {
  const res = await fetch(`${API_URL}/settings/admin_docs`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.value) return null;
  return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
}

export async function saveRemoteDocs(
  updatedDocs: AdminDoc[],
  token: string | null,
  userId?: string,
  username?: string,
): Promise<boolean> {
  const res = await fetch(`${API_URL}/settings/admin_docs`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    },
    body: JSON.stringify({
      value: JSON.stringify(updatedDocs),
      userId,
      username: username ?? 'Admin',
    }),
  });
  return res.ok;
}
