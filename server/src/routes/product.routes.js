const { Router } = require("express");
const controller = require("../controllers/product.controller");
const router = new Router();

router.get(["/", "/get-all"], controller.getAll);
router.post("/create",controller.create);
router.put("/update/:id",controller.update);
router.get("/search",controller.search);
router.get("/:id", controller.getById);

module.exports = router;