const companyRepository = require("../repositories/company.repository");
const AppError = require("../errors/app-error");

const DEFAULT_COMPANY_ID = "company-default";

// Solo estos campos son editables desde la app (evita que se cuelen
// columnas como id/createdAt en el UPDATE).
const EDITABLE_FIELDS = [
  "name",
  "slogan",
  "phone",
  "address",
  "currency",
  "currencySymbol",
  "themeMode",
];

const VALID_THEME_MODES = ["light", "dark", "system"];

class CompanyService {
  async getCompany(companyId) {
    const id = companyId || DEFAULT_COMPANY_ID;
    const company = await companyRepository.getById(id);
    if (!company) {
      throw new AppError("Empresa no encontrada", 404, "NOT_FOUND");
    }
    return company;
  }

  async updateCompany(companyId, data) {
    const id = companyId || DEFAULT_COMPANY_ID;

    const fields = {};
    for (const key of EDITABLE_FIELDS) {
      if (data[key] !== undefined) fields[key] = data[key];
    }

    if (fields.name !== undefined && !String(fields.name).trim()) {
      throw new AppError("El nombre de la empresa es obligatorio", 400, "VALIDATION");
    }
    if (
      fields.themeMode !== undefined &&
      !VALID_THEME_MODES.includes(fields.themeMode)
    ) {
      throw new AppError("Modo de tema inválido", 400, "VALIDATION");
    }

    const updated = await companyRepository.update(id, fields);
    if (!updated) {
      throw new AppError("Empresa no encontrada", 404, "NOT_FOUND");
    }
    return updated;
  }
}

module.exports = new CompanyService();
