/**
 * Dynamic Pricing Engine for Shopify Product Customizer
 */
export function calculateCustomizerPrice({
  product,
  selectedMaterialId,
  layersByView = {},
  activeViewId = "front",
  quantity = 1,
}) {
  if (!product) {
    return {
      basePrice: 0,
      materialAddon: 0,
      printAreaAddon: 0,
      extraColorsAddon: 0,
      layersAddon: 0,
      unitPrice: 0,
      totalPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      breakdown: [],
    };
  }

  const basePrice =
    Number(product.basePrice) !== undefined && !isNaN(Number(product.basePrice)) && Number(product.basePrice) > 0
      ? Number(product.basePrice)
      : 25.0;

  // Material addon
  const materialObj = (product.materials || []).find((m) => m.id === selectedMaterialId);
  const materialAddon = materialObj ? materialObj.priceAddon : 0;

  // Count total layers across all views
  let totalLayersCount = 0;
  let uniqueColors = new Set();
  let printViewsUsed = new Set();

  Object.entries(layersByView).forEach(([viewId, layers]) => {
    if (Array.isArray(layers) && layers.length > 0) {
      printViewsUsed.add(viewId);
      totalLayersCount += layers.length;

      layers.forEach((layer) => {
        if (layer.color) uniqueColors.add(layer.color);
        if (layer.strokeColor) uniqueColors.add(layer.strokeColor);
      });
    }
  });

  // Print area addon ($5 for front/back print, $3 for secondary views)
  let printAreaAddon = 0;
  printViewsUsed.forEach((viewId) => {
    if (viewId === "front" || viewId === "back") {
      printAreaAddon += 5.0;
    } else {
      printAreaAddon += 3.0;
    }
  });

  // Extra colors charge ($2 per color beyond the first color)
  const colorsCount = uniqueColors.size;
  const extraColorsAddon = colorsCount > 1 ? (colorsCount - 1) * 2.0 : 0;

  // Layer complexity surcharge ($1 per layer beyond 2 layers)
  const layersAddon = totalLayersCount > 2 ? (totalLayersCount - 2) * 1.0 : 0;

  const unitPrice = basePrice + materialAddon + printAreaAddon + extraColorsAddon + layersAddon;

  // Quantity tier discounts
  let discountPercent = 0;
  if (quantity >= 25) discountPercent = 30;
  else if (quantity >= 10) discountPercent = 20;
  else if (quantity >= 5) discountPercent = 10;

  const subtotal = unitPrice * quantity;
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalPrice = subtotal - discountAmount;

  return {
    basePrice,
    materialAddon,
    printAreaAddon,
    extraColorsAddon,
    layersAddon,
    unitPrice: parseFloat(unitPrice.toFixed(2)),
    quantity,
    discountPercent,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    breakdown: [
      { label: "Base Product Price", amount: basePrice },
      materialAddon > 0 && { label: `Material (${materialObj?.name})`, amount: materialAddon },
      printAreaAddon > 0 && { label: `Print Locations (${printViewsUsed.size} side${printViewsUsed.size > 1 ? 's' : ''})`, amount: printAreaAddon },
      extraColorsAddon > 0 && { label: `Extra Colors (${colorsCount} colors)`, amount: extraColorsAddon },
      layersAddon > 0 && { label: `Design Layers (${totalLayersCount} layers)`, amount: layersAddon },
    ].filter(Boolean),
  };
}
