const companyService = require("../services/company.service");
const asyncHandler = require("../utils/asyncHandler");

// La empresa del usuario autenticado viene del staff (companyId).
// Si el staff no la tuviera, cae a la empresa por defecto.
const resolveCompanyId = (req) => req.staff?.companyId || "company-default";

exports.getMine = asyncHandler(async (req, res) => {
  const company = await companyService.getCompany(resolveCompanyId(req));
  res.json({ success: true, company });
});

exports.update = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(
    resolveCompanyId(req),
    req.body
  );
  res.json({ success: true, company });
});
