export function formatoCOP(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";
  const num = Number(valor);
  if (isNaN(num)) return "-";
  return num.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function parsePrecioInput(input) {
  if (input === null || input === undefined) return NaN;
  let s = String(input).trim();
  if (s === "") return NaN;

  s = s.replace(/\s+/g, "");

  if (s.indexOf(',') !== -1 && s.indexOf('.') !== -1) {
    s = s.replace(/\./g, '');
    s = s.replace(/,/g, '.');
  } else {
    const parts = s.split('.');
    if (parts.length > 2) {
      s = s.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length <= 2) {
    } else if (parts.length === 2 && parts[1].length > 2) {
      s = s.replace(/\./g, '');
    }
    if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
      s = s.replace(/,/g, '.');
    }
  }

  const n = Number(s);
  return isNaN(n) ? NaN : n;
}
 
// Devuelve el número formateado con separadores de miles, sin símbolo de moneda.
export function formatoCOPSinSimbolo(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  const num = Number(valor);
  if (isNaN(num)) return "";
  return num.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}
 
