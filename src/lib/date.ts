export function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}

export function formatBirthDate(date?: string | null, day?: number | null, month?: number | null, hideYear = false) {
  if (day && month) {
    const shortDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
    if (!date || hideYear) return shortDate;
  }
  if (!date) return "-";
  const formatted = formatDate(date);
  return hideYear ? formatted.slice(0, 5) : formatted;
}

export function parseBirthDateInput(value: string): { birth_date: string | null; birth_day: number | null; birth_month: number | null } {
  const clean = value.trim();
  if (!clean) return { birth_date: null, birth_day: null, birth_month: null };
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [year, month, day] = clean.split("-").map(Number);
    return { birth_date: clean, birth_day: day, birth_month: month };
  }
  const match = clean.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
  if (!match) return { birth_date: null, birth_day: null, birth_month: null };
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3];
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return { birth_date: null, birth_day: null, birth_month: null };
  }
  return {
    birth_date: year ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null,
    birth_day: day,
    birth_month: month
  };
}

export function formatDateTime(date?: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date));
}

export function isBirthdayThisWeek(birthDate?: string | null, birthDay?: number | null, birthMonth?: number | null) {
  if (!birthDate && (!birthDay || !birthMonth)) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  const birthday = birthDate ? new Date(birthDate) : null;
  const month = birthMonth ? birthMonth - 1 : birthday!.getUTCMonth();
  const day = birthDay ?? birthday!.getUTCDate();
  const candidate = new Date(now.getFullYear(), month, day);
  if (candidate < today) candidate.setFullYear(now.getFullYear() + 1);
  return candidate >= today && candidate <= end;
}

export function formatBirthdayRadar(birthDate?: string | null, birthDay?: number | null, birthMonth?: number | null) {
  if (!birthDate && (!birthDay || !birthMonth)) return "-";
  const source = birthDate ? new Date(birthDate) : null;
  const month = birthMonth ? birthMonth - 1 : source!.getUTCMonth();
  const day = birthDay ?? source!.getUTCDate();
  const now = new Date();
  const candidate = new Date(now.getFullYear(), month, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (candidate < today) candidate.setFullYear(now.getFullYear() + 1);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(candidate);
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")} - ${weekday}`;
}

export function isOlderThanDays(date: string | null | undefined, days: number) {
  if (!date) return true;
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  return new Date(date) < limit;
}
