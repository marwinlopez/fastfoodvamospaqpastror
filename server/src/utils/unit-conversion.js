// Conversión entre unidades de medida físicas.
// Cada unidad se normaliza a una base por dimensión:
//   masa    -> gramos, volumen -> mililitros, conteo -> unidades.
// Solo se puede convertir entre unidades de la misma dimensión.

const UNIT_TABLE = {
  // masa (base: gramos)
  gramos: { dim: "masa", factor: 1 },
  gramo: { dim: "masa", factor: 1 },
  gr: { dim: "masa", factor: 1 },
  g: { dim: "masa", factor: 1 },
  kilogramos: { dim: "masa", factor: 1000 },
  kilogramo: { dim: "masa", factor: 1000 },
  kilos: { dim: "masa", factor: 1000 },
  kilo: { dim: "masa", factor: 1000 },
  kg: { dim: "masa", factor: 1000 },
  libras: { dim: "masa", factor: 453.592 },
  libra: { dim: "masa", factor: 453.592 },
  lb: { dim: "masa", factor: 453.592 },
  lbs: { dim: "masa", factor: 453.592 },
  onzas: { dim: "masa", factor: 28.3495 },
  onza: { dim: "masa", factor: 28.3495 },
  oz: { dim: "masa", factor: 28.3495 },

  // volumen (base: mililitros)
  mililitros: { dim: "volumen", factor: 1 },
  mililitro: { dim: "volumen", factor: 1 },
  ml: { dim: "volumen", factor: 1 },
  litros: { dim: "volumen", factor: 1000 },
  litro: { dim: "volumen", factor: 1000 },
  l: { dim: "volumen", factor: 1000 },
  lt: { dim: "volumen", factor: 1000 },

  // conteo (base: unidades)
  unidades: { dim: "conteo", factor: 1 },
  unidad: { dim: "conteo", factor: 1 },
  unid: { dim: "conteo", factor: 1 },
  und: { dim: "conteo", factor: 1 },
  ud: { dim: "conteo", factor: 1 },
  u: { dim: "conteo", factor: 1 },
};

function lookup(unitName) {
  const key = (unitName || "").toString().trim().toLowerCase().replace(/\.$/, "");
  return UNIT_TABLE[key] || null;
}

/**
 * Convierte `value` desde `fromUnit` hacia `toUnit`.
 * Si alguna unidad es desconocida o las dimensiones no coinciden,
 * devuelve el valor sin convertir (comportamiento tolerante: unidades
 * personalizadas como "UNID" de un producto se comparan tal cual).
 */
function convertUnits(value, fromUnit, toUnit) {
  const val = parseFloat(value) || 0;
  const from = lookup(fromUnit);
  const to = lookup(toUnit);
  if (!from || !to || from.dim !== to.dim) return val;
  return (val * from.factor) / to.factor;
}

/** true si ambas unidades son conocidas y de la misma dimensión */
function areConvertible(fromUnit, toUnit) {
  const from = lookup(fromUnit);
  const to = lookup(toUnit);
  return Boolean(from && to && from.dim === to.dim);
}

module.exports = { convertUnits, areConvertible };
