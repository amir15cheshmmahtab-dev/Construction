const persianNumber = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })

/** Format a count or a display amount using Persian digits. */
export function formatNumber(value: number): string {
  return persianNumber.format(value)
}

/** Convert canonical rials into a Persian toman amount, without the unit suffix. */
export function formatToman(priceRial: number | null): string {
  return priceRial === null ? 'استعلام قیمت' : formatNumber(priceRial / 10)
}
