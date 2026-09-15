/** Client-side validatsiya — backend `app/core/validators.py` bilan bir xil qoidalar. */

export type PhoneCountry = {
  code: string;
  flag: string;
  name: string;
  dial: string;
  /** Kod dan keyingi raqamlar soni */
  digits: number;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "UZ", flag: "🇺🇿", name: "O‘zbekiston", dial: "+998", digits: 9 },
  { code: "KG", flag: "🇰🇬", name: "Qirg‘iziston", dial: "+996", digits: 9 },
  { code: "TJ", flag: "🇹🇯", name: "Tojikiston", dial: "+992", digits: 9 },
  { code: "KZ", flag: "🇰🇿", name: "Qozog‘iston", dial: "+7", digits: 10 },
  { code: "RU", flag: "🇷🇺", name: "Rossiya", dial: "+7", digits: 10 },
  { code: "TR", flag: "🇹🇷", name: "Turkiya", dial: "+90", digits: 10 },
  { code: "AE", flag: "🇦🇪", name: "BAA", dial: "+971", digits: 9 },
];

export const CUSTOM_COUNTRY: PhoneCountry = {
  code: "XX",
  flag: "🌐",
  name: "Boshqa",
  dial: "+",
  digits: 0,
};

const NAME_RE = /^[A-Za-zÀ-ÿА-Яа-яЁёЎўҚқҒғҲҳ'ʼ’\-\s.]+$/;

export function validateName(
  value: string,
  { required = true, label = "Ism" } = {},
): string | null {
  const v = value.trim();
  if (!v) return required ? `${label} kiritilishi shart` : null;
  if (/\d/.test(v)) return `${label} raqam bo‘lmasligi kerak`;
  if (!NAME_RE.test(v)) return `${label} faqat harflardan iborat bo‘lsin`;
  if (v.length < 2) return `${label} juda qisqa`;
  return null;
}

/** E.164 (+998901234567) ni davlat + local raqamga ajratadi. */
export function splitPhone(e164: string): { country: PhoneCountry; local: string } {
  const clean = e164.replace(/[^\d+]/g, "");
  if (!clean) return { country: PHONE_COUNTRIES[0], local: "" };
  // Uzun dial kodlarni avval tekshiramiz (+998 dan oldin +9 yo‘q, lekin +7 vs +90 muhim)
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (clean.startsWith(c.dial)) {
      return { country: c, local: clean.slice(c.dial.length) };
    }
  }
  return { country: CUSTOM_COUNTRY, local: clean.replace(/^\+/, "") };
}

export function joinPhone(country: PhoneCountry, local: string, customDial = ""): string {
  const digits = local.replace(/\D/g, "");
  const dial = country.code === "XX" ? `+${customDial.replace(/\D/g, "")}` : country.dial;
  return digits ? `${dial}${digits}` : "";
}

export function validatePhone(
  country: PhoneCountry,
  local: string,
  customDial = "",
): string | null {
  const digits = local.replace(/\D/g, "");
  if (!digits) return "Telefon kiritilishi shart";
  if (country.code === "XX") {
    const d = customDial.replace(/\D/g, "");
    if (d.length < 1 || d.length > 3) return "Davlat kodi 1–3 raqam (+XX)";
    if (digits.length < 6 || digits.length > 12) return "Raqam 6–12 raqamdan iborat bo‘lsin";
    return null;
  }
  if (digits.length !== country.digits) {
    return `${country.name} raqami ${country.digits} raqamdan iborat bo‘lishi kerak`;
  }
  return null;
}

export function validateDate(
  value: string,
  { required = false, label = "Sana", future = false } = {},
): string | null {
  const v = value.trim();
  if (!v) return required ? `${label} kiritilishi shart` : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
    return `${label} noto‘g‘ri formatda`;
  }
  if (future) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(v) <= today) return `${label} kelajakdagi sana bo‘lishi kerak`;
  }
  return null;
}

export function validateDateRange(start: string, end: string): string | null {
  if (start && end && new Date(end) < new Date(start)) {
    return "Qaytish sanasi ketish sanasidan oldin bo‘lmasligi kerak";
  }
  return null;
}

export function validateChildrenAges(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const parts = v.split(",").map((p) => p.trim()).filter(Boolean);
  for (const p of parts) {
    if (!/^\d{1,2}$/.test(p)) return "Format: 5, 8 (vergul bilan)";
    if (Number(p) > 17) return "Bola yoshi 0–17 oralig‘ida";
  }
  return null;
}

export function validateNumber(
  value: string | number,
  { label = "Qiymat", min = 0, max, positive = false } = {} as {
    label?: string;
    min?: number;
    max?: number;
    positive?: boolean;
  },
): string | null {
  const n = typeof value === "number" ? value : Number(String(value).replace(/\s/g, ""));
  if (String(value).trim() === "" || Number.isNaN(n)) return `${label} raqam bo‘lishi kerak`;
  if (positive && n <= 0) return `${label} 0 dan katta bo‘lsin`;
  if (n < min) return `${label} ${min} dan kam bo‘lmasin`;
  if (max !== undefined && n > max) return `${label} ${max} dan oshmasin`;
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} kiritilishi shart`;
}

/** Bo‘sh bo‘lmagan xatolar mavjudmi */
export function hasErrors(errors: Record<string, string | null | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
