import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from '../src/store/cart'

describe('Cart store', () => {
  beforeEach(() => {
    // reset store state between tests
    useCartStore.setState({ items: [], isOpen: false })
  })

  it('adds an item and respects stock limit', () => {
    const item = {
      id: 'p1',
      name: 'Tomate',
      price: 100,
      stock: 2,
      unit: 'kg',
      campesinoId: 'c1',
      campesinoName: 'Juan'
    }

    useCartStore.getState().addItem(item as any, 3)
    const items = useCartStore.getState().items
    expect(items.length).toBe(1)
    expect(items[0].quantity).toBe(2) // capped to stock
  })

  it('updates quantity and removes when quantity <= 0', () => {
    const item = {
      id: 'p2',
      name: 'Papa',
      price: 50,
      stock: 10,
      unit: 'kg',
      campesinoId: 'c2',
      campesinoName: 'Pedro'
    }

    useCartStore.getState().addItem(item as any, 2)
    useCartStore.getState().updateQuantity('p2', 5)
    expect(useCartStore.getState().getTotalItems()).toBe(5)

    useCartStore.getState().updateQuantity('p2', 0)
    expect(useCartStore.getState().items.length).toBe(0)
  })

  it('calculates total price and groups by vendor', () => {
    const a = { id: 'a', name: 'A', price: 10, stock: 10, unit: 'u', campesinoId: 'v1', campesinoName: 'V1' }
    const b = { id: 'b', name: 'B', price: 20, stock: 5, unit: 'u', campesinoId: 'v1', campesinoName: 'V1' }
    const c = { id: 'c', name: 'C', price: 5, stock: 3, unit: 'u', campesinoId: 'v2', campesinoName: 'V2' }

    useCartStore.getState().addItem(a as any, 2)
    useCartStore.getState().addItem(b as any, 1)
    useCartStore.getState().addItem(c as any, 3)

    expect(useCartStore.getState().getTotalPrice()).toBe(2 * 10 + 1 * 20 + 3 * 5)

    const grouped = useCartStore.getState().getItemsByVendor()
    expect(Object.keys(grouped).length).toBe(2)
    expect(grouped['v1'].items.length).toBe(2)
    expect(grouped['v2'].items.length).toBe(1)
  })
})
