const API_BASE_URL = "/api";

export const registerUser = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error(`Failed with status ${res.status}`);
  return res.json();
};
