const NodeCache = require("node-cache");
const divisasRepository = require("../repositories/divisas.repository");
const { apis } = require("../api");

// Cache con TTL de 15 minutos (900 segundos)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

class DivisasService {
  async getExchangeRate(name) {
    const cacheKey = `divisa_${name}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const rates = await divisasRepository.getByDocumentIdAsArray(name);
    if (rates.length > 0) {
      const rate = rates[0];
      cache.set(cacheKey, rate);
      return rate;
    }
    return null;
  }

  async createDivisa(body) {
    const { name } = body;
    const existing = await divisasRepository.getById(name);
    let result;
    if (existing) {
      result = await divisasRepository.update(name, body);
    } else {
      result = await divisasRepository.create(body);
    }
    
    // Invalidar/actualizar cache
    cache.set(`divisa_${name}`, { id: name, ...body });
    return result;
  }

  async filterDivisas(filter) {
    const cacheKey = `divisa_filter_${filter}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await divisasRepository.getByDocumentIdAsArray(filter);
    cache.set(cacheKey, result);
    return result;
  }

  async getParalelo() {
    const cacheKey = "divisas_paralelo";
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await divisasRepository.getByName("DolarToday");
    cache.set(cacheKey, result);
    return result;
  }

  async fetchExternalExchangeRates() {
    const exchangeBCV = await apis.getExchangeBCV();
    const { BCV } = exchangeBCV.sources;
    const exchangeDT = await apis.getExchangeDT();
    const { DolarToday } = exchangeDT.sources;

    return [
      {
        sources: "BCV",
        quote: BCV.quote,
      },
      {
        sources: "DolarToday",
        quote: DolarToday.quote,
      },
    ];
  }
}

module.exports = new DivisasService();
