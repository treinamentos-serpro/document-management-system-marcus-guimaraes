async function request(endpoint, owner, options = {}) {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: { 'X-User-Id': owner, ...options.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error?.message || 'Não foi possível concluir a solicitação.');
  }
  return response;
}

export async function listDocuments(owner) {
  const response = await request('/documents', owner);
  const result = await response.json();
  return result.documents;
}

export async function uploadDocument(owner, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await request('/upload', owner, {
    method: 'POST',
    body: formData,
  });
  return (await response.json()).document;
}

export async function downloadDocument(owner, document) {
  const response = await request(`/documents/${encodeURIComponent(document.id)}/download`, owner);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = document.originalName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}