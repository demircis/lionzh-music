export function secondsToHHMMSS(seconds: string) {
  const sec = parseInt(seconds) % 60;
  const min = Math.floor(parseInt(seconds) / 60);
  const h = Math.floor(parseInt(seconds) / 3600);
  return h > 0
    ? `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec
        .toString()
        .padStart(2, "0")}`
    : `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
