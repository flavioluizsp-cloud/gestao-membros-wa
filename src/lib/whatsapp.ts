export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = onlyDigits(phone);
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function renderTemplate(template: string, values: Record<string, string | null | undefined>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "");
}
