"""Umumiy validatorlar — schemas.py fayllarida field_validator ichida chaqiriladi."""

import re
from datetime import date, datetime

NAME_RE = re.compile(r"^[A-Za-zÀ-ÿА-Яа-яЁёЎўҚқҒғҲҳ'ʼ’\-\s.]+$")
PHONE_RE = re.compile(r"^\+\d{7,15}$")
DATE_FMT = "%Y-%m-%d"
DATETIME_FMT = "%Y-%m-%dT%H:%M"


def person_name(value: str, *, required: bool = True, label: str = "Ism") -> str:
    v = " ".join(value.strip().split())
    if not v:
        if required:
            raise ValueError(f"{label} kiritilishi shart")
        return ""
    if any(ch.isdigit() for ch in v):
        raise ValueError(f"{label} raqam bo'lmasligi kerak")
    if not NAME_RE.match(v):
        raise ValueError(f"{label} faqat harflardan iborat bo'lishi kerak")
    if len(v) < 2:
        raise ValueError(f"{label} juda qisqa")
    return v


def phone_e164(value: str, *, required: bool = True) -> str:
    v = re.sub(r"[\s\-()]", "", value.strip())
    if not v:
        if required:
            raise ValueError("Telefon kiritilishi shart")
        return ""
    if not v.startswith("+"):
        v = "+" + v
    if not PHONE_RE.match(v):
        raise ValueError("Telefon formati: +998901234567")
    return v


def iso_date(value: str, *, required: bool = False, label: str = "Sana") -> str:
    v = value.strip()
    if not v:
        if required:
            raise ValueError(f"{label} kiritilishi shart")
        return ""
    try:
        datetime.strptime(v, DATE_FMT)
    except ValueError as exc:
        raise ValueError(f"{label} formati YYYY-MM-DD bo'lishi kerak") from exc
    return v


def iso_datetime(value: str, *, label: str = "Vaqt") -> str:
    v = value.strip()
    if not v:
        return ""
    for fmt in (DATETIME_FMT, DATE_FMT):
        try:
            datetime.strptime(v, fmt)
            return v
        except ValueError:
            continue
    raise ValueError(f"{label} formati YYYY-MM-DDTHH:MM bo'lishi kerak")


def future_date(value: str, *, label: str) -> str:
    v = iso_date(value, label=label)
    if v and date.fromisoformat(v) <= date.today():
        raise ValueError(f"{label} kelajakdagi sana bo'lishi kerak")
    return v


def children_ages(value: str) -> str:
    v = value.strip()
    if not v:
        return ""
    parts = [p.strip() for p in v.split(",") if p.strip()]
    ages: list[int] = []
    for p in parts:
        if not p.isdigit():
            raise ValueError("Bolalar yoshi: vergul bilan raqamlar (5, 8)")
        n = int(p)
        if n > 17:
            raise ValueError("Bola yoshi 0–17 oralig'ida bo'lishi kerak")
        ages.append(n)
    return ", ".join(str(a) for a in ages)
