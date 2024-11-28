import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartItem } from '../hooks/useShoppingCart'

interface ShoppingCartProps {
  cart: CartItem[]
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  getTotalPrice: () => number
  onPurchase: () => void
}

export function ShoppingCart({
  cart,
  removeFromCart,
  updateQuantity,
  getTotalPrice,
  onPurchase,
}: ShoppingCartProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2 dark:text-white">Shopping Cart</h3>
      {cart.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span className="dark:text-white">{item.name}</span>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                  className="w-16 mr-2"
                />
                <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <p className="text-lg font-bold dark:text-white">Total: ${getTotalPrice().toFixed(2)}</p>
            <Button className="w-full mt-2" onClick={onPurchase}>
              Purchase
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
