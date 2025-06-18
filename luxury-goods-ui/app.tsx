"use client"

import { useState, useEffect } from "react"
import { AppConfig, showConnect, UserSession } from "@stacks/connect"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  User,
  Home,
  Search,
  Moon,
  Sun,
  Wallet,
  Star,
  Filter,
  Grid,
  List,
  Heart,
  ShoppingCart,
  Package,
  Gem,
  Crown,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useShoppingCart } from "@/hooks/useShoppingCart"
import { ShoppingCart as ShoppingCartComponent } from "@/shoppingCart"
import { luxuryProducts, sampleNFTs, categories, type Product, type NFTItem } from "@/data/products"
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
export default function LuxuryGoodsApp() {
  const appConfig = new AppConfig(["store_write", "publish_data"])
  const userSession = new UserSession({ appConfig })

  // State management
  const [userAddress, setUserAddress] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(sessionStorage.getItem("userAddress") || "null")
    }
    return null
  })
  const [activeTab, setActiveTab] = useState("home")
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchasedItem, setPurchasedItem] = useState<Product | null>(null)
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>(sampleNFTs)

  // Shopping cart hook
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useShoppingCart()

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: "Luxury Goods Store",
        icon: "",
      },
      onFinish: () => {
        const userData = userSession.loadUserData()
        const testnetAddress = userData.profile.stxAddress.testnet

        setUserAddress(testnetAddress)
        sessionStorage.setItem("userAddress", JSON.stringify(testnetAddress))
      },
      userSession,
    })
  }

  // Filter products based on search and category
  const filteredProducts = luxuryProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handlePurchase = (product: Product) => {
    // Simulate purchase and NFT minting
    setPurchasedItem(product)
    setShowPurchaseModal(true)

    // Add NFT to user's collection
    const newNFT: NFTItem = {
      id: userNFTs.length + 1,
      name: `${product.name} NFT`,
      image: product.image,
      description: `Digital certificate for ${product.name} purchase`,
      tokenId: userNFTs.length + 1,
      mintDate: new Date().toISOString().split('T')[0]
    }
    setUserNFTs([...userNFTs, newNFT])

    // Clear cart after purchase
    clearCart()
  }

  const handleCartPurchase = () => {
    if (cart.length > 0) {
      // For demo purposes, just use the first item in cart
      handlePurchase({
        id: cart[0].id,
        name: `Cart Items (${cart.length} items)`,
        price: getTotalPrice(),
        image: "/images/cart-purchase.jpg",
        description: `Purchase of ${cart.length} luxury items`,
        category: "Mixed",
        brand: "Various",
        inStock: true
      })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white shadow-lg">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="relative z-10">
                <h1 className="mb-2 text-4xl font-bold flex items-center gap-3">
                  <Crown className="h-10 w-10" />
                  Luxury Goods Store
                </h1>
                <p className="mb-4 max-w-lg text-white/90">
                  Discover exclusive luxury items and receive unique NFTs as proof of authenticity with every purchase.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                    <Gem className="h-3 w-3 mr-1" />
                    Premium Quality
                  </Badge>
                  <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    NFT Certificates
                  </Badge>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search luxury items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        In Stock
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{product.brand}</span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-2xl font-bold text-purple-600">${product.price.toLocaleString()}</span>
                          <Button
                            onClick={() => addToCart(product)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

          </div>
        )
      case "nfts":
        return (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 p-8 text-white shadow-lg">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="relative z-10">
                <h1 className="mb-2 text-3xl font-bold flex items-center gap-3">
                  <Sparkles className="h-8 w-8" />
                  My NFT Collection
                </h1>
                <p className="mb-4 max-w-lg text-white/90">
                  Your digital certificates and proof of authenticity for luxury purchases.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userNFTs.map((nft) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                      <Gem className="h-16 w-16 text-purple-500" />
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{nft.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{nft.description}</p>
                        {nft.tokenId && (
                          <Badge variant="outline">Token ID: {nft.tokenId}</Badge>
                        )}
                        {nft.mintDate && (
                          <p className="text-xs text-gray-500">Minted: {nft.mintDate}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )
      case "profile":
        return (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-white shadow-lg">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="relative z-10">
                <h1 className="mb-2 text-3xl font-bold flex items-center gap-3">
                  <User className="h-8 w-8" />
                  Profile
                </h1>
                <p className="mb-4 max-w-lg text-white/90">
                  Manage your account and view your luxury goods history.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Address</label>
                  <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {userAddress || "Not connected"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total NFTs Owned</label>
                  <p className="text-2xl font-bold text-purple-600">{userNFTs.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</label>
                  <p className="text-gray-800 dark:text-gray-200">January 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }



      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 bg-white/80 backdrop-blur-xl dark:bg-slate-950/80 border-r border-gray-200 dark:border-gray-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                <Crown className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Luxury Store
              </h2>
            </div>

            <nav className="space-y-2">
              <Button
                variant={activeTab === "home" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "home" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""}`}
                onClick={() => setActiveTab("home")}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button
                variant={activeTab === "nfts" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "nfts" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""}`}
                onClick={() => setActiveTab("nfts")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                My NFTs
              </Button>
              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "profile" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-950/80 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTab === "home" && "Luxury Goods"}
                  {activeTab === "nfts" && "My NFT Collection"}
                  {activeTab === "profile" && "Profile"}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                {userAddress ? (
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-mono">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserAddress(null)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleConnect}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            <main className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Right Sidebar - Shopping Cart */}
            <div className="w-80 bg-white/80 backdrop-blur-xl dark:bg-slate-950/80 border-l border-gray-200 dark:border-gray-800 p-6">
              <ShoppingCartComponent
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                getTotalPrice={getTotalPrice}
                onPurchase={handleCartPurchase}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Success Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600 dark:text-green-500">
              <Sparkles className="mr-2 h-5 w-5" />
              Purchase Successful!
            </DialogTitle>
            <DialogDescription>
              Your luxury item has been purchased and an NFT has been minted to your wallet as proof of authenticity.
            </DialogDescription>
          </DialogHeader>
          {purchasedItem && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                {purchasedItem.name}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Price: ${purchasedItem.price.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                NFT Certificate: Minted successfully
              </p>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
              onClick={() => {
                setShowPurchaseModal(false)
                setPurchasedItem(null)
              }}
            >
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

