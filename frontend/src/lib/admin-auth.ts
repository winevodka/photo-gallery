export const ADMIN_SESSION_COOKIE = 'admin_session';

export function isValidAdminSession(cookieValue: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !cookieValue) {
    return false;
  }
  return cookieValue === expected;
}
