export function initials(name: string) { return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(); }
export function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const units = [[31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"]] as const;
  const unit = units.find(([amount]) => seconds >= amount);
  return unit ? `${Math.floor(seconds / unit[0])}${unit[1]} ago` : "just now";
}
