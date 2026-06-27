import React from "react";
import { useContext } from "react";
import { GlobalContext } from "../context/GlobalContext";

const useCalculator = () => {
  const { state } = useContext(GlobalContext);

  const typeRound = (num, decimals = decimalPrecio) => {
    num = parseFloat(num);
    // half epsilon to correct edge cases.
    let c = 0.5 * Number.EPSILON * num;
    let p = 1;
    while (decimals-- > 0) p *= 10;
    if (num < 0) p *= -1;
    return Math.round((num + c) * p) / p;
  };

  const trunc = (num, decimals = decimalPrecio) => {
    //
    let x = num;
    let s = x.toString().replaceAll(",", "");
    x = s;
    let l = s.length;
    let decimalLength = s.indexOf(".") + 1;

    if (l - decimalLength <= decimals) {
      return x;
    }
    // Parte decimal del número
    let isNeg = x < 0;
    let decimal = x % 1;
    let entera = isNeg ? Math.ceil(x) : Math.floor(x);
    let decimalFormated = Math.floor(
      Math.abs(decimal) * Math.pow(10, decimals)
    );
    let finalNum =
      entera + (decimalFormated / Math.pow(10, decimals)) * (isNeg ? -1 : 1);
    return finalNum;
  };

  const round = (valor, decimals = 5) => {
    valor += "";
    let x = valor.split(".");
    let partEntera = x[0];
    let partDecimal = x[1];
    if (valor.indexOf(".") > 0) {
      if (partDecimal.length === decimals + 1) {
        if (parseInt(partDecimal[decimals]) > 5) {
          valor = typeRound(valor, decimals);
        } else if (parseInt(partDecimal[decimals]) < 5) {
          valor = trunc(valor, decimals);
        } else if (parseInt(partDecimal[decimals]) === 5) {
          let retenido =
            partDecimal.length > 2
              ? partDecimal[decimals - 1]
              : partEntera[partEntera.length > 1 ? partEntera.length - 1 : 0];
          let esPar = parseInt(retenido) % 2 === 1;
          valor = esPar ? typeRound(valor, decimals) : trunc(valor, decimals);
        }
      } else if (partDecimal.length > decimals) {
        let cifraEliminar = partDecimal.substring(decimals, partDecimal.length);
        let cifraComparar = "5".padEnd(cifraEliminar.length, "0");

        if (parseInt(cifraEliminar) > parseInt(cifraComparar)) {
          valor = typeRound(valor, decimals);
        } else if (parseInt(cifraEliminar) < parseInt(cifraComparar)) {
          valor = trunc(valor, decimals);
        }
      }
    }

    return parseFloat(valor);
  };

  const sumar = (sumando_a, sumando_b) => {
    const result = Number.parseFloat(sumando_a + sumando_b).toFixed(10);
    return parseFloat(result);
  };

  const restar = (minuendo, sustraendo) => {
    const result = Number.parseFloat(minuendo - sustraendo).toFixed(10);
    return parseFloat(result);
  };

  const multiplicar = (multiplicando, multiplicador) => {
    const result = parseFloat(
      Number.parseFloat(multiplicando * multiplicador).toFixed(10)
    );
    return round(result);
  };

  const dividir = (dividendo, divisor) => {
    const result = parseFloat(
      Number.parseFloat(dividendo / divisor).toFixed(10)
    );
    return round(result);
  };

  return {
    sumar,
    restar,
    multiplicar,
    dividir,
  };
};

export default useCalculator;
