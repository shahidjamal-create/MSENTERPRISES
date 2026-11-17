import { HttpError } from './http.js';

const fail = (message) => {
  throw new HttpError(400, message);
};

export function text(value, label, { required = true, max = 500, min = 0 } = {}) {
  const v = value == null ? '' : String(value).trim();
  if (required && !v) fail(`${label} is required.`);
  if (v && v.length < min) fail(`${label} must be at least ${min} characters.`);
  if (v.length > max) fail(`${label} must be under ${max} characters.`);
  return v;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function email(value, label = 'Email', { required = true } = {}) {
  const v = text(value, label, { required, max: 160 }).toLowerCase();
  if (v && !EMAIL_RE.test(v)) fail(`Please enter a valid ${label.toLowerCase()}.`);
  return v;
}

export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

export function phone(value, label = 'Phone number', { required = true } = {}) {
  const v = normalizePhone(value);
  if (!v) {
    if (required) fail(`${label} is required.`);
    return '';
  }
  if (!/^[6-9]\d{9}$/.test(v)) fail(`${label} must be a valid 10-digit mobile number.`);
  return v;
}

export function number(value, label, { min = 0, max = 10000000, required = true, integer = false } = {}) {
  if (value === '' || value == null) {
    if (required) fail(`${label} is required.`);
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) fail(`${label} must be a number.`);
  if (integer && !Number.isInteger(n)) fail(`${label} must be a whole number.`);
  if (n < min || n > max) fail(`${label} must be between ${min} and ${max}.`);
  return n;
}

export function id(value, label = 'ID') {
  return number(value, label, { min: 1, max: 2147483647, integer: true });
}

export function oneOf(value, label, options) {
  if (!options.includes(value)) fail(`${label} is not valid.`);
  return value;
}

export function date(value, label) {
  const v = text(value, label, { max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) fail(`${label} is not a valid date.`);
  return v;
}

export const bool = (v) => v === true || v === 'true' || v === 1 || v === '1';

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Today's date in India (YYYY-MM-DD), used for appointment validation.
export function todayIST() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}
