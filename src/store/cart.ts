import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
  unit: string
  purchaseUnit?: string
  campesinoId: string
  campesinoName: string
  imageUrl?: string
  metodosEntrega?: string[] | string | null
  deliveryMethod?: string
  preparation?: {
    acciones: string[]
    madurez: string
    tamano: string
    notas: string
  }
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemsByVendor: () => { [campesinoId: string]: { campesinoName: string; items: CartItem[] } }
  toggleCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.id === newItem.id && item.purchaseUnit === (newItem as any).purchaseUnit)

        const qtyToAdd = Math.max(1, Math.floor(quantity))

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === newItem.id && item.purchaseUnit === (newItem as any).purchaseUnit
                ? { ...item, quantity: Math.min(item.quantity + qtyToAdd, item.stock) }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...newItem, quantity: Math.min(qtyToAdd, newItem.stock) }]
          })
        }
      },
      
      removeItem: (itemId) => {
        set({
          items: get().items.filter(item => item.id !== itemId)
        })
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === itemId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      getItemsByVendor: () => {
        const items = get().items
        const grouped: { [campesinoId: string]: { campesinoName: string; items: CartItem[] } } = {}
        
        items.forEach(item => {
          if (!grouped[item.campesinoId]) {
            grouped[item.campesinoId] = {
              campesinoName: item.campesinoName,
              items: []
            }
          }
          grouped[item.campesinoId].items.push(item)
        })
        
        return grouped
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      }
    }),
    {
      name: 'agroconecta-cart'
    }
  )
)
