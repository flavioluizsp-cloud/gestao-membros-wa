export function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}

export function formatDateTime(date?: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date));
}

export function isBirthdayThisWeek(birthDate?: string | null) {
  if (!birthDate) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  const birthday = new Date(birthDate);
  const candidate = new Date(now.getFullYear(), birthday.getUTCMonth(), birthday.getUTCDate());
  if (candidate < today) candidate.setFullYear(now.getFullYear() + 1);
  return candidate >= today && candidate <= end;
}

export function isOlderThanDays(date: string | null | undefined, days: number) {
  if (!date) return true;
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  return new Date(date) < limit;
}
