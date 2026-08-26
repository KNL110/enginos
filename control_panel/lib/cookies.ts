export function hasCookie(name: string): boolean {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((entry) => entry.split("=")[0] === name);
}
