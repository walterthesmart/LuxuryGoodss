export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
  brand: string
  inStock: boolean
}

export interface NFTItem {
  id: number
  name: string
  image: string
  description: string
  tokenId?: number
  mintDate?: string
}

export const luxuryProducts: Product[] = [
  {
    id: 1,
    name: "Diamond Encrusted Watch",
    price: 25000,
    image: "/images/watch1.jpg",
    description: "Exquisite timepiece with genuine diamonds and Swiss movement",
    category: "Watches",
    brand: "LuxeTime",
    inStock: true
  },
  {
    id: 2,
    name: "Platinum Necklace",
    price: 15000,
    image: "/images/necklace1.jpg",
    description: "Handcrafted platinum necklace with rare gemstones",
    category: "Jewelry",
    brand: "Royal Gems",
    inStock: true
  },
  {
    id: 3,
    name: "Designer Handbag",
    price: 8000,
    image: "/images/handbag1.jpg",
    description: "Limited edition leather handbag from renowned designer",
    category: "Fashion",
    brand: "Elite Fashion",
    inStock: true
  },
  {
    id: 4,
    name: "Gold Cufflinks",
    price: 3500,
    image: "/images/cufflinks1.jpg",
    description: "18k gold cufflinks with intricate engravings",
    category: "Accessories",
    brand: "Golden Touch",
    inStock: true
  },
  {
    id: 5,
    name: "Luxury Perfume Set",
    price: 1200,
    image: "/images/perfume1.jpg",
    description: "Exclusive fragrance collection with rare ingredients",
    category: "Fragrance",
    brand: "Scent Royale",
    inStock: true
  },
  {
    id: 6,
    name: "Crystal Champagne Flutes",
    price: 2800,
    image: "/images/champagne1.jpg",
    description: "Hand-blown crystal champagne flutes set of 6",
    category: "Home",
    brand: "Crystal Elite",
    inStock: true
  },
  {
    id: 7,
    name: "Silk Scarf Collection",
    price: 950,
    image: "/images/scarf1.jpg",
    description: "Premium silk scarves with artistic patterns",
    category: "Fashion",
    brand: "Silk Dreams",
    inStock: true
  },
  {
    id: 8,
    name: "Vintage Wine Collection",
    price: 12000,
    image: "/images/wine1.jpg",
    description: "Rare vintage wines from prestigious vineyards",
    category: "Beverages",
    brand: "Vintage Cellars",
    inStock: true
  }
]

export const sampleNFTs: NFTItem[] = [
  {
    id: 1,
    name: "Diamond Watch NFT",
    image: "/images/nft1.jpg",
    description: "Digital certificate for Diamond Encrusted Watch purchase",
    tokenId: 1,
    mintDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Platinum Necklace NFT",
    image: "/images/nft2.jpg",
    description: "Digital certificate for Platinum Necklace purchase",
    tokenId: 2,
    mintDate: "2024-01-20"
  },
  {
    id: 3,
    name: "Designer Handbag NFT",
    image: "/images/nft3.jpg",
    description: "Digital certificate for Designer Handbag purchase",
    tokenId: 3,
    mintDate: "2024-02-01"
  }
]

export const categories = [
  "All",
  "Watches",
  "Jewelry", 
  "Fashion",
  "Accessories",
  "Fragrance",
  "Home",
  "Beverages"
]
