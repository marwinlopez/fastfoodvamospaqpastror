// Conversión de unidades de peso/volumen para comparar stock disponible
// contra la cantidad requerida por un ingrediente, cuando no coinciden.
export const convertUnits = (value, fromUnit, toUnit) => {
  const from = (fromUnit || "").toLowerCase().trim();
  const to = (toUnit || "").toLowerCase().trim();
  if (from === to) return value;
  if (from === "kilogramos" && to === "gramos") return value * 1000;
  if (from === "gramos" && to === "kilogramos") return value / 1000;
  if (from === "litros" && to === "mililitros") return value * 1000;
  if (from === "mililitros" && to === "litros") return value / 1000;
  if (from === "libras" && to === "gramos") return value * 453.592;
  if (from === "gramos" && to === "libras") return value / 453.592;
  return value;
};

// Precio de UNA unidad íntegra de un producto (ej. 1 botella), no del
// empaque completo. precioCompra es el precio de todo el empaque, que
// puede contener varias unidades (cantidadPresentacion × cantidadEmpaque) —
// ej. una caja de 36 maltas a $17 son $0.47 cada una, no $17 cada una.
// Mismo criterio que ya usa el servidor para el costo de un ingrediente.
export const getProductUnitPrice = (product) => {
  if (!product) return 0;
  const price = parseFloat(product.precioCompra || 0);
  const packQty = parseFloat(product.cantidadPresentacion || 1) || 1;
  const unitQty = parseFloat(product.cantidadEmpaque || 1) || 1;
  return price / (packQty * unitQty);
};

// Cuántas porciones de `rec` alcanza a producir el inventario actual,
// recorriendo recursivamente sub-recetas. `prods` y `recs` deben incluir
// los ingredientes de cada receta (no sirve el listado resumido de la API).
export const calculateMaxProduction = (rec, prods, recs, visited = new Set()) => {
  if (!rec || !rec.ingredients || rec.ingredients.length === 0) return 0;

  const recId = rec.recipeId || rec.id;
  if (recId) {
    if (visited.has(recId)) return 0;
    visited.add(recId);
  }

  let minProduction = Infinity;

  for (const ing of rec.ingredients) {
    const isSubRecipe = ing.subRecipeId !== null && ing.subRecipeId !== undefined;
    const ingQty = parseFloat(ing.quantity || ing.quantityUnitOfMeasurement || 0);
    if (ingQty <= 0) continue;

    if (isSubRecipe) {
      const subRec = recs.find(r => (r.recipeId || r.id) === ing.subRecipeId);
      if (subRec) {
        // subRecMax = lotes de la sub-receta que alcanza el inventario actual.
        // Cada lote rinde subRec.weight gramos, así que el total disponible
        // es lotes × rendimiento, no los lotes en sí (que no tienen unidad
        // de peso comparable con ingQty).
        const subRecMax = calculateMaxProduction(subRec, prods, recs, new Set(visited));
        const subRecYield = parseFloat(subRec.weight || 0);
        const availableSubStock = convertUnits(subRecMax * subRecYield, "gramos", ing.unitOfMeasurement);
        const ingredientMax = availableSubStock / ingQty;
        minProduction = Math.min(minProduction, ingredientMax);
      } else {
        minProduction = 0;
      }
    } else {
      const pId = ing.productId || ing.id;
      const prod = prods.find(p => (p.productId || p.id || p.productoId) === pId);
      if (prod) {
        // Stock disponible = unidades individuales × contenido por unidad
        const productStock = parseFloat(prod.cantidadPresentacion || 0) * parseFloat(prod.stock || 0);
        const availableStock = convertUnits(productStock, prod.unidadMedida, ing.unitOfMeasurement);
        const ingredientMax = availableStock / ingQty;
        minProduction = Math.min(minProduction, ingredientMax);
      } else {
        minProduction = 0;
      }
    }
  }

  return minProduction === Infinity ? 0 : Math.floor(minProduction);
};

// Cuántas unidades de un platillo-combo alcanza a armar el inventario
// actual. A diferencia de un ingrediente dentro de una receta (que se mide
// en peso/volumen), cada componente de un combo se necesita como unidad
// entera (1 hamburguesa, 1 refresco, 2 papas) — por eso es una cuenta
// simple por división, no una conversión de unidades de peso.
// `components`: [{ recipeId, productId, quantity }]. `prods`/`recs` deben
// incluir los ingredientes de cada receta (no sirve el listado resumido).
export const calculateComboCapacity = (components, prods, recs) => {
  if (!components || components.length === 0) return 0;

  let minCombos = Infinity;

  for (const comp of components) {
    const qtyNeeded = parseFloat(comp.quantity || 0);
    if (qtyNeeded <= 0) continue;

    let availableUnits = 0;
    if (comp.recipeId) {
      const recipe = recs.find(r => (r.recipeId || r.id) === comp.recipeId);
      availableUnits = recipe ? calculateMaxProduction(recipe, prods, recs) : 0;
    } else if (comp.productId) {
      const product = prods.find(p => (p.productId || p.id) === comp.productId);
      availableUnits = product ? Math.floor(parseFloat(product.stock || 0)) : 0;
    } else {
      continue;
    }

    const combosFromComponent = Math.floor(availableUnits / qtyNeeded);
    minCombos = Math.min(minCombos, combosFromComponent);
  }

  return minCombos === Infinity ? 0 : minCombos;
};
