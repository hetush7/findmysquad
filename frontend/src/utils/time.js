// "Closes in 3h 20m", "Closes in 12m", "Closing now"
export function closesInLabel(expiresAt, now = Date.now()) {
  const minutes = Math.floor((new Date(expiresAt).getTime() - now) / 60000);
  if (minutes < 1) {
    return "Closing now";
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `Closes in ${rest}m`;
  }
  return rest === 0 ? `Closes in ${hours}h` : `Closes in ${hours}h ${rest}m`;
}
