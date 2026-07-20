const products = require("./product.routes");
const divisas = require("./divisas.routes");
const recetas = require("./recetas.routes");
const ingredientes = require("./ingredientes.routes");
const units = require("./units.routes");
const menu = require("./menu.routes");
const category = require("./category.routes");
const role = require("./role.routes");
const staff = require("./staff.routes");

module.exports = (app) => {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Alias para peticiones de la app móvil
  app.use("/api/product", products);
  app.use("/api/products", products);
  app.use("/api/divisas", divisas);
  app.use("/api/recipe", recetas);
  app.use("/api/ingredient", ingredientes);
  app.use("/api/unit", units);
  app.use("/api/menu", menu);
  app.use("/api/category", category);
  app.use("/api/role", role);
  app.use("/api/staff", staff);
};
