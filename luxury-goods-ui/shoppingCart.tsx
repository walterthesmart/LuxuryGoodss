"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CartItem } from "../hooks/useShoppingCart"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react"

interface ShoppingCartProps {
  cart: CartItem[]
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  getTotalPrice: () => number
  onPurchase: () => void
}

export function ShoppingCart({ cart, removeFromCart, updateQuantity, getTotalPrice, onPurchase }: ShoppingCartProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl shadow-lg overflow-hidden"
    >
      <div
        className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-bold flex items-center justify-between">
          <span className="flex items-center">
            <ShoppingBag className="mr-2" />
            Shopping Cart
          </span>
          <span className="text-sm bg-white text-purple-500 px-2 py-1 rounded-full">{cart.length} items</span>
        </h3>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 p-4 text-center">Your cart is empty</p>
            ) : (
              <div className="p-4">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="dark:text-white font-medium">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value, 10))}
                        className="w-16 text-center"
                      />
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                <motion.div
                  className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xl font-bold dark:text-white mb-4">Total: ${getTotalPrice().toFixed(2)}</p>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    onClick={onPurchase}
                  >
                    Complete Purchase
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

