const FALLBACK_ADMIN_EMAILS = [
  "admin@gmail.com",
  "fadilahikhsann@gmail.com",
];

export function getAdminEmails() {
  const configuredEmails = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return new Set(
    configuredEmails?.length ? configuredEmails : FALLBACK_ADMIN_EMAILS,
  );
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && getAdminEmails().has(email.toLowerCase()));
}
