export const PRODUCTS_DATA = [
  {
    id: "t-shirt",
    name: "Unisex Heavy Cotton T-Shirt",
    category: "Apparel",
    basePrice: 20.0,
    colors: [
      { id: "white", name: "White", hex: "#FFFFFF", image: "/images/product/product-01.jpg" },
      { id: "black", name: "Black", hex: "#111827", image: "/images/product/product-02.jpg" },
      { id: "navy", name: "Navy Blue", hex: "#1E3A8A", image: "/images/product/product-03.jpg" },
      { id: "red", name: "Crimson Red", hex: "#DC2626", image: "/images/product/product-04.jpg" },
      { id: "emerald", name: "Forest Green", hex: "#059669", image: "/images/product/product-05.jpg" },
    ],
    materials: [
      { id: "standard", name: "100% Cotton", priceAddon: 0 },
      { id: "organic", name: "Organic Premium Cotton", priceAddon: 8.0 },
      { id: "tri-blend", name: "Ultra-Soft Tri-Blend", priceAddon: 5.0 },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    views: [
      { id: "front", label: "Front View", printArea: { x: 25, y: 22, width: 50, height: 60 } },
      { id: "back", label: "Back View", printArea: { x: 25, y: 20, width: 50, height: 65 } },
      { id: "sleeve_left", label: "Left Sleeve", printArea: { x: 35, y: 30, width: 30, height: 35 } },
      { id: "sleeve_right", label: "Right Sleeve", printArea: { x: 35, y: 30, width: 30, height: 35 } },
      { id: "label", label: "Inside Label", printArea: { x: 38, y: 15, width: 24, height: 20 } },
    ],
  },
  {
    id: "hoodie",
    name: "Premium Fleece Pullover Hoodie",
    category: "Apparel",
    basePrice: 38.0,
    colors: [
      { id: "black", name: "Black", hex: "#111827", image: "/images/product/product-02.jpg" },
      { id: "heather-gray", name: "Heather Gray", hex: "#9CA3AF", image: "/images/product/product-01.jpg" },
      { id: "navy", name: "Navy Blue", hex: "#1E3A8A", image: "/images/product/product-03.jpg" },
    ],
    materials: [
      { id: "standard-fleece", name: "80/20 Cotton-Poly Fleece", priceAddon: 0 },
      { id: "heavyweight", name: "Heavyweight 400GSM Organic", priceAddon: 12.0 },
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    views: [
      { id: "front", label: "Front View", printArea: { x: 28, y: 28, width: 44, height: 48 } },
      { id: "back", label: "Back View", printArea: { x: 25, y: 20, width: 50, height: 60 } },
      { id: "sleeve_left", label: "Left Sleeve", printArea: { x: 35, y: 25, width: 30, height: 45 } },
    ],
  },
  {
    id: "mug",
    name: "Ceramic Coffee Mug (11 oz)",
    category: "Drinkware",
    basePrice: 12.0,
    colors: [
      { id: "white", name: "Pure White", hex: "#FFFFFF", image: "/images/product/product-03.jpg" },
      { id: "black-inner", name: "White w/ Black Inner", hex: "#374151", image: "/images/product/product-04.jpg" },
    ],
    materials: [
      { id: "ceramic", name: "Standard Ceramic", priceAddon: 0 },
      { id: "magic-mug", name: "Color-Changing Magic Ceramic", priceAddon: 6.0 },
    ],
    sizes: ["11 oz", "15 oz"],
    views: [
      { id: "front", label: "Center Wrap", printArea: { x: 15, y: 15, width: 70, height: 70 } },
      { id: "left", label: "Left Handle View", printArea: { x: 20, y: 20, width: 60, height: 60 } },
      { id: "right", label: "Right Handle View", printArea: { x: 20, y: 20, width: 60, height: 60 } },
    ],
  },
  {
    id: "phone-case",
    name: "Tough Protective Phone Case",
    category: "Accessories",
    basePrice: 22.0,
    colors: [
      { id: "clear", name: "Clear Transparent", hex: "#E5E7EB", image: "/images/product/product-05.jpg" },
      { id: "matte-black", name: "Matte Black", hex: "#1F2937", image: "/images/product/product-02.jpg" },
    ],
    materials: [
      { id: "slim", name: "Snap Slim Case", priceAddon: 0 },
      { id: "tough", name: "Dual-Layer Tough Armor", priceAddon: 5.0 },
    ],
    sizes: ["iPhone 15 Pro", "iPhone 15 Pro Max", "Samsung S24 Ultra"],
    views: [
      { id: "back", label: "Back Cover", printArea: { x: 10, y: 10, width: 80, height: 80 } },
    ],
  },
  {
    id: "tote-bag",
    name: "Heavy Canvas Shopping Tote Bag",
    category: "Bags",
    basePrice: 15.0,
    colors: [
      { id: "natural", name: "Natural Beige", hex: "#F3F4F6", image: "/images/product/product-01.jpg" },
      { id: "black", name: "Jet Black", hex: "#111827", image: "/images/product/product-02.jpg" },
    ],
    materials: [
      { id: "10oz", name: "10 oz Eco Canvas", priceAddon: 0 },
      { id: "14oz-organic", name: "14 oz Heavy Organic Cotton", priceAddon: 4.0 },
    ],
    sizes: ["Standard (15\"x16\")"],
    views: [
      { id: "front", label: "Front Side", printArea: { x: 20, y: 25, width: 60, height: 55 } },
      { id: "back", label: "Back Side", printArea: { x: 20, y: 25, width: 60, height: 55 } },
    ],
  },
];

export const FONTS_LIST = [
  { name: "Inter", family: "Inter, sans-serif", category: "Sans-Serif" },
  { name: "Roboto", family: "Roboto, sans-serif", category: "Sans-Serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "Serif" },
  { name: "Outfit", family: "Outfit, sans-serif", category: "Modern" },
  { name: "Cinzel Decorative", family: "'Cinzel', serif", category: "Elegant" },
  { name: "Pacifico", family: "'Pacifico', cursive", category: "Script" },
  { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "Display" },
  { name: "Courier Prime", family: "'Courier Prime', monospace", category: "Monospace" },
];

export const TEMPLATES_DATA = [
  {
    id: "tpl-wedding-01",
    title: "Elegant Wedding Save the Date",
    category: "Wedding",
    productType: "t-shirt",
    thumbnail: "/images/product/product-01.jpg",
    layers: [
      { id: "t1", type: "text", text: "FOREVER & ALWAYS", fontSize: 24, fontFamily: "Cinzel Decorative", color: "#D97706", x: 50, y: 35, curved: true, arcAngle: 25 },
      { id: "t2", type: "text", text: "Sarah & Michael • 2026", fontSize: 16, fontFamily: "Playfair Display", color: "#374151", x: 50, y: 55, curved: false },
    ]
  },
  {
    id: "tpl-birthday-01",
    title: "Vintage 1990 Birthday Edition",
    category: "Birthday",
    productType: "t-shirt",
    thumbnail: "/images/product/product-02.jpg",
    layers: [
      { id: "t1", type: "text", text: "LEGEND SINCE 1990", fontSize: 32, fontFamily: "Bebas Neue", color: "#EF4444", x: 50, y: 38, strokeColor: "#000000", strokeWidth: 2 },
      { id: "t2", type: "text", text: "100% ORIGINAL PARTS", fontSize: 14, fontFamily: "Inter", color: "#F59E0B", x: 50, y: 56 },
    ]
  },
  {
    id: "tpl-business-01",
    title: "Modern Tech Startup Brand",
    category: "Business",
    productType: "hoodie",
    thumbnail: "/images/product/product-03.jpg",
    layers: [
      { id: "t1", type: "text", text: "CYBER CORE INC.", fontSize: 28, fontFamily: "Outfit", color: "#3B82F6", x: 50, y: 40 },
      { id: "t2", type: "text", text: "INNOVATE THE FUTURE", fontSize: 12, fontFamily: "Roboto", color: "#9CA3AF", x: 50, y: 52 },
    ]
  },
  {
    id: "tpl-eid-01",
    title: "Eid Mubarak Crescent Celebration",
    category: "Eid",
    productType: "t-shirt",
    thumbnail: "/images/product/product-04.jpg",
    layers: [
      { id: "t1", type: "text", text: "EID MUBARAK", fontSize: 30, fontFamily: "Cinzel Decorative", color: "#10B981", x: 50, y: 35, curved: true, arcAngle: 30 },
      { id: "t2", type: "text", text: "Joy & Blessings", fontSize: 18, fontFamily: "Pacifico", color: "#F59E0B", x: 50, y: 55 },
    ]
  },
  {
    id: "tpl-halloween-01",
    title: "Spooky Pumpkin Nights",
    category: "Halloween",
    productType: "mug",
    thumbnail: "/images/product/product-05.jpg",
    layers: [
      { id: "t1", type: "text", text: "SPOOKY SIPS", fontSize: 26, fontFamily: "Bebas Neue", color: "#F97316", x: 50, y: 42, shadowColor: "#7C2D12", shadowBlur: 10 },
    ]
  }
];

export const CLIPARTS_DATA = [
  { id: "c1", name: "Golden Crown", category: "Badges", svg: "<svg viewBox='0 0 24 24' fill='#F59E0B'><path d='M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z'/></svg>" },
  { id: "c2", name: "Crescent Moon", category: "Ornaments", svg: "<svg viewBox='0 0 24 24' fill='#10B981'><path d='M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.999z'/></svg>" },
  { id: "c3", name: "Sparkle Star", category: "Shapes", svg: "<svg viewBox='0 0 24 24' fill='#3B82F6'><path d='M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z'/></svg>" },
  { id: "c4", name: "Heart Love", category: "Symbols", svg: "<svg viewBox='0 0 24 24' fill='#EF4444'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>" },
  { id: "c5", name: "Fire Flame", category: "Icons", svg: "<svg viewBox='0 0 24 24' fill='#F97316'><path d='M12 23c-4.97 0-9-4.03-9-9 0-3.62 2.14-6.8 5.45-8.2.35-.15.75.05.85.4.1.35-.06.75-.41.9C6.01 8.35 4.5 11.02 4.5 14c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-2.09-.85-4.08-2.34-5.55l-1.07 1.07c-.2.2-.51.2-.71 0s-.2-.51 0-.71l1.78-1.78c.2-.2.51-.2.71 0 1.88 1.88 2.93 4.4 2.93 7.07 0 4.97-4.03 9-9 9z'/></svg>" },
];
