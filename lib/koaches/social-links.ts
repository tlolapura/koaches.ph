function trim(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

export function instagramProfileUrl(value: string): string {
  const raw = trim(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "").replace(/\//g, "");
  return `https://instagram.com/${handle}`;
}

export function facebookProfileUrl(value: string): string {
  const raw = trim(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "").replace(/\//g, "");
  return `https://facebook.com/${handle}`;
}

export function displayInstagram(value: string): string {
  const raw = trim(value);
  if (!raw) return "";
  const urlMatch = raw.match(/instagram\.com\/([^/?#]+)/i);
  if (urlMatch) return `@${urlMatch[1]}`;
  return raw.startsWith("@") ? raw : `@${raw}`;
}

export function displayFacebook(value: string): string {
  const raw = trim(value);
  if (!raw) return "";
  const urlMatch = raw.match(/facebook\.com\/([^/?#]+)/i);
  if (urlMatch) return urlMatch[1];
  return raw.replace(/^@/, "");
}
