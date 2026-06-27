const { Router } = require("express");
const controller = require("../controllers/divisas.controller");
const router = new Router();

router.get("/filter/:filter",controller.filter);
router.post("/create",controller.create);
router.get("/update-exchenge",controller.updateExchange);

module.exports = router;