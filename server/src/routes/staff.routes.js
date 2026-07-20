const { Router } = require("express");
const controller = require("../controllers/staff.controller");
const router = new Router();

router.get("/", controller.getAll);
router.post("/create", controller.create);
router.put("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);

module.exports = router;
