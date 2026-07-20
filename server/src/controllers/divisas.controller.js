const divisasService = require("../services/divisas.service");
const asyncHandler = require("../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  const { body } = req;
  await divisasService.createDivisa(body);
  res.status(202).json({ message: "Registro actualizado" });
});

exports.filter = asyncHandler(async (req, res) => {
  const filterVal = req.params.filter || req.body.filter;
  const data = await divisasService.filterDivisas(filterVal);
  res.json({ data });
});

exports.getParalelo = asyncHandler(async (req, res) => {
  const data = await divisasService.getParalelo();
  res.json(data);
});

exports.updateExchange = asyncHandler(async (req, res) => {
  const tasa = await divisasService.fetchExternalExchangeRates();
  res.status(202).json({
    message: "Se actualizo la tasa de cambio",
    tasa,
  });
});
