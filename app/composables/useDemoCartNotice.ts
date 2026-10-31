import { useCartStore } from '~/stores/cart'
import { useUiStore } from '~/stores/ui'
import { formatNumber } from '~/utils/format'
import { formatProductQuantity } from '~/utils/product-detail'

/** A readable local basket summary while the full cart page remains a later phase. */
export function useDemoCartNotice() {
  const cart = useCartStore()
  const ui = useUiStore()
  function showCart() {
    if (!cart.itemCount) {
      ui.notify('سبد نمونهٔ شما خالی است. از صفحهٔ محصول، تعداد دلخواه را اضافه کنید.')
      return
    }
    const items = cart.items
      .slice(0, 3)
      .map((item) => `${item.name}: ${formatProductQuantity(item.quantity)} ${item.unit}`)
      .join('؛ ')
    ui.notify(
      `سبد نمونهٔ محلی شما، ${formatNumber(cart.itemCount)} نوع محصول: ${items}${cart.itemCount > 3 ? '؛ و محصولات دیگر' : ''}. این سبد، سفارش واقعی نیست.`,
    )
  }
  return { cart, showCart }
}
