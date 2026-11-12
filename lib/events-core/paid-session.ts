export type PurchaseAccess = { purchaseId: string; token: string; checkoutKey?: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const token = /^[A-Za-z0-9_-]{43}$/
const key = (eventId: string, purchaseId: string) => `estl-ticket:v1:${eventId}:${purchaseId}`

/** Tab-only proofs. No cached payment status, buyer details or QR codes. */
export function rememberPurchase(eventId: string, access: PurchaseAccess): void {
  try { sessionStorage.setItem(key(eventId, access.purchaseId), JSON.stringify({ ...access, savedAt: Date.now() })) }
  catch { /* Recovery by email remains available when storage is unavailable. */ }
}
export function recallPurchase(eventId: string, purchaseId: string): PurchaseAccess | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key(eventId, purchaseId)) ?? "null")
    if (!value || value.purchaseId !== purchaseId || !uuid.test(purchaseId) || typeof value.token !== "string" || !token.test(value.token)) return null
    if (!Number.isFinite(value.savedAt) || value.savedAt > Date.now() || Date.now() - value.savedAt >= 86_400_000) return null
    return { purchaseId, token: value.token, ...(typeof value.checkoutKey === "string" && uuid.test(value.checkoutKey) ? { checkoutKey: value.checkoutKey } : {}) }
  } catch { return null }
}
