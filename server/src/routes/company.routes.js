const { Router } = require("express");
const controller = require("../controllers/company.controller");
const router = new Router();

router.get("/", controller.getMine);
router.get("/me", controller.getMine);
router.put("/update", controller.update);

module.exports = router;
