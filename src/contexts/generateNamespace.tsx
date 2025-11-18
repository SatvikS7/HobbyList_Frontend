
export function getUserIdFromToken() {
  const token = sessionStorage.getItem("jwt_token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.sub || payload.userId || null;
}