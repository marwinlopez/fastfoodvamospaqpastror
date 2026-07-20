const router = require("express").Router();
const ingredientController = require("../controllers/ingredient.controller");

router.get("/:id", ingredientController.getById);
router.post("/create", ingredientController.create);
router.put("/update/:id", ingredientController.update);
router.delete("/delete/:id", ingredientController.delete);

module.exports = router;
