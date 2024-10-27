'use client'

import { useState, useEffect } from 'react'
import { AppConfig, showConnect, UserSession } from '@stacks/connect'
import { Moon, Sun, ShoppingCart, User, Home, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

// Mock data for products and NFTs
const products = [
  { id: 1, name: 'Luxury Watch', price: 5000, image: '/placeholder.svg?height=200&width=200' },
  { id: 2, name: 'Designer Handbag', price: 3000, image: '/placeholder.svg?height=200&width=200' },
  { id: 3, name: 'Premium Sunglasses', price: 500, image: '/placeholder.svg?height=200&width=200' },
]

const nfts = [
  { id: 1, name: 'Luxury Watch NFT', image: '/placeholder.svg?height=100&width=100' },
  { id: 2, name: 'Designer Handbag NFT', image: '/placeholder.svg?height=100&width=100' },
  { id: 3, name: 'Premium Sunglasses NFT', image: '/placeholder.svg?height=100&width=100' },
]

export default function LuxuryGoodsApp() {
  const [userAddress, setUserAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(sessionStorage.getItem('userAddress') || 'null')
    }
    return null
  })
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [cart, setCart] = useState([])
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const {
        profile: {
          stxAddress: { testnet },
        },
      } = userSession.loadUserData()
      setUserAddress(testnet)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleConnectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Luxury Goods Store',
        icon: '/placeholder.svg?height=32&width=32',
      },
      onFinish: () => {
        const {
          profile: {
            stxAddress: { testnet },
          },
        } = userSession.loadUserData()

        setUserAddress(testnet)
        sessionStorage.setItem('userAddress', JSON.stringify(testnet))
      },
      userSession,
    })
  }

  const addToCart = (product) => {
    setCart([...cart, product])
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const handlePurchase = () => {
    // Here you would integrate with your smart contract to process the purchase and mint NFTs
    setShowPurchaseModal(true)
    setCart([])
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-500">Luxury Goods</h1>
          </div>
          <nav className="mt-8">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('home')}
            >
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('profile')}
            >
              <User className="mr-2 h-4 w-4" /> Profile
            </Button>
            <Button
              variant={activeTab === 'nfts' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('nfts')}
            >
              <Image className="mr-2 h-4 w-4" /> My NFTs
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'home' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Featured Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
                      <p className="text-lg font-bold dark:text-white">${product.price}</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => addToCart(product)}>Add to Cart</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">User Profile</h2>
              <Card>
                <CardContent className="mt-4">
                  <Label htmlFor="wallet-address">Wallet Address</Label>
                  <Input id="wallet-address" value={userAddress || ''} readOnly />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">My NFTs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nfts.map((nft) => (
                  <Card key={nft.id}>
                    <CardContent className="p-4">
                      <img src={nft.image} alt={nft.name} className="w-full h-32 object-cover mb-2" />
                      <p className="text-sm font-medium dark:text-white">{nft.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={handleConnectWallet}>
              {!userAddress ? 'Connect Wallet' : 'Wallet Connected'}
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2 dark:text-white">Shopping Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
            ) : (
              <div>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <span className="dark:text-white">{item.name}</span>
                    <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button className="w-full mt-4" onClick={handlePurchase}>
                  Purchase
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Purchase confirmation modal */}
      <Sheet open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Purchase Confirmation</SheetTitle>
            <SheetDescription>
              Your purchase has been processed successfully. NFTs have been minted and added to your collection.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <Button onClick={() => setShowPurchaseModal(false)}>Close</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}