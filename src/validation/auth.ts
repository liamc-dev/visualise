export function emailValidator(v: string) {
  const value = v.trim().toLowerCase();
  if (!value) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email.";
  return null;
}

export function passwordValidator(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Min 8 characters.";
  return null;
}

export function usernameOptionalValidator(v: string) {
  const value = v.trim();
  if (!value) return null; // optional
  if (value.length < 3) return "Username must be 3+ chars.";
  if (value.length > 30) return "Username must be 30 chars or less.";
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) return "Use letters, numbers, dot, dash, underscore.";
  return null;
}
