const products = require("./product.routes");
const divisas = require("./divisas.routes");
const { db } = require("../firebase");

const calculateTotalWeight = async (recipeId) => {
  const ingSnapshot = await db.collection("ingredients")
    .where("recipeId", "==", recipeId)
    .get();
  
  let totalWeightGrams = 0;
  
  for (const d of ingSnapshot.docs) {
    const data = d.data();
    let qty = parseFloat(data.quantity || data.quantityUnitOfMeasurement || 0);
    const unit = (data.unitOfMeasurement || "").toLowerCase();
    
    // Ignore units like "Unidades"
    if (["gramos", "g", "gr", "mililitros", "ml"].includes(unit)) {
      totalWeightGrams += qty;
    } else if (["kilogramos", "kg", "kilos", "litros", "l"].includes(unit)) {
      totalWeightGrams += (qty * 1000);
    } else if (["libras", "lb", "lbs"].includes(unit)) {
      totalWeightGrams += (qty * 453.592);
    } else if (data.subRecipeId) {
      // If it's a subrecipe, assume quantity is "unidades" of the recipe,
      // so we need to add its yield * qty.
      // But sub-recipes will now have their own `weight` property in grams!
      const recipeDoc = await db.collection("recipes").doc(data.subRecipeId).get();
      if (recipeDoc.exists) {
        const rData = recipeDoc.data();
        if (rData.weight) {
           totalWeightGrams += (parseFloat(rData.weight) * qty);
        }
      }
    }
  }
  return totalWeightGrams;
};

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

  // --- Endpoints de Recetas ---
  app.get("/api/recipe", async (req, res, next) => {
    try {
      const snapshot = await db.collection("recipes").get();
      const recipes = snapshot.docs.map((doc) => ({
        recipeId: doc.id,
        ...doc.data(),
      }));
      res.json({ success: true, recipes });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/recipe/:id", async (req, res, next) => {
    try {
      const doc = await db.collection("recipes").doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Receta no encontrada" });
      }
      const recipeData = { recipeId: doc.id, ...doc.data() };

      const ingSnapshot = await db.collection("ingredients")
        .where("recipeId", "==", req.params.id)
        .get();
      const ingredients = ingSnapshot.docs.map((d) => ({
        idIngredient: d.id,
        ...d.data(),
      }));
      recipeData.ingredients = ingredients;
      res.json({ success: true, recipe: recipeData });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/recipe/create", async (req, res, next) => {
    try {
      const { name, cost, coin, isActive } = req.body;
      const docRef = db.collection("recipes").doc();
      const newRecipe = {
        recipeId: docRef.id,
        name: name || "",
        cost: cost || 0,
        coin: coin || "USD",
        isActive: isActive !== undefined ? isActive : true,
        ingredients: [],
      };
      await docRef.set(newRecipe);
      res.json({ success: true, recipe: newRecipe });
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/recipe/update/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await db.collection("recipes").doc(id).set({ name }, { merge: true });
      res.json({ success: true, message: "Receta actualizada" });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/recipe/delete/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      await db.collection("recipes").doc(id).delete();
      res.json({ success: true, message: "Receta eliminada" });
    } catch (err) {
      next(err);
    }
  });

  // --- Endpoints de Ingredientes ---
  app.post("/api/ingredient/create", async (req, res, next) => {
    try {
      const {
        recipeId,
        productId,
        unitOfMeasurement,
        quantityUnitOfMeasurement,
      } = req.body;

      // Consultar producto o sub-receta para obtener costo y descripción
      let cost = 0;
      let description = "";
      
      if (req.body.subRecipeId) {
        const recipeDoc = await db.collection("recipes").doc(req.body.subRecipeId).get();
        if (recipeDoc.exists) {
          const recipeData = recipeDoc.data();
          description = recipeData.name || "Sub-Receta";
          const unitPrice = parseFloat(recipeData.cost || 0); // Assuming 1 unit is the full recipe cost
          cost = unitPrice * parseFloat(quantityUnitOfMeasurement || 0);
        } else {
          description = "Sub-Receta " + req.body.subRecipeId;
          cost = 1.0 * parseFloat(quantityUnitOfMeasurement || 0);
        }
      } else {
        const prodDoc = await db.collection("products").doc(productId).get();
        if (prodDoc.exists) {
          const prodData = prodDoc.data();
          description = prodData.producto || prodData.name || "";
          const price = parseFloat(prodData.precioCompra || prodData.price || 0);
          const packQty = parseFloat(prodData.cantidadPresentacion || 1);
          const unitQty = parseFloat(prodData.cantidadEmpaque || 1);
          const unitPrice = price / (packQty * unitQty);
          cost = unitPrice * parseFloat(quantityUnitOfMeasurement || 0);
        } else {
          description = "Ingrediente " + productId;
          cost = 1.0 * parseFloat(quantityUnitOfMeasurement || 0);
        }
      }

      const docRef = db.collection("ingredients").doc();
      const newIng = {
        idIngredient: docRef.id,
        recipeId,
        ...(req.body.subRecipeId ? { subRecipeId: req.body.subRecipeId } : { productId }),
        description,
        unitOfMeasurement,
        quantityUnitOfMeasurement: parseFloat(quantityUnitOfMeasurement),
        quantity: parseFloat(quantityUnitOfMeasurement),
        cost: cost,
        isActive: 1,
      };
      await docRef.set(newIng);

      // Calcular y actualizar costo total de la receta
      const ingSnapshot = await db.collection("ingredients")
        .where("recipeId", "==", recipeId)
        .get();
      let totalCost = 0;
      ingSnapshot.docs.forEach((d) => {
        totalCost += parseFloat(d.data().cost || 0);
      });

      const totalWeightGrams = await calculateTotalWeight(recipeId);

      await db.collection("recipes").doc(recipeId).update({
        cost: totalCost,
        profit: totalCost * 0.3,
        price: totalCost * 1.3,
        weight: totalWeightGrams,
      });

      res.json({ success: true, ingredient: newIng });
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/ingredient/update/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        recipeId,
        productId,
        unitOfMeasurement,
        quantityUnitOfMeasurement,
      } = req.body;

      const doc = await db.collection("ingredients").doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Ingrediente no encontrado" });
      }

      // Consultar producto o sub-receta para obtener costo y descripción
      let cost = 0;
      let description = "";
      
      if (req.body.subRecipeId) {
        const recipeDoc = await db.collection("recipes").doc(req.body.subRecipeId).get();
        if (recipeDoc.exists) {
          const recipeData = recipeDoc.data();
          description = recipeData.name || "Sub-Receta";
          const unitPrice = parseFloat(recipeData.cost || 0);
          cost = unitPrice * parseFloat(quantityUnitOfMeasurement || 0);
        } else {
          description = "Sub-Receta " + req.body.subRecipeId;
          cost = 1.0 * parseFloat(quantityUnitOfMeasurement || 0);
        }
      } else {
        const prodDoc = await db.collection("products").doc(productId).get();
        if (prodDoc.exists) {
          const prodData = prodDoc.data();
          description = prodData.producto || prodData.name || "";
          const price = parseFloat(prodData.precioCompra || prodData.price || 0);
          const packQty = parseFloat(prodData.cantidadPresentacion || 1);
          const unitQty = parseFloat(prodData.cantidadEmpaque || 1);
          const unitPrice = price / (packQty * unitQty);
          cost = unitPrice * parseFloat(quantityUnitOfMeasurement || 0);
        } else {
          description = "Ingrediente " + productId;
          cost = 1.0 * parseFloat(quantityUnitOfMeasurement || 0);
        }
      }

      const updatedIng = {
        recipeId,
        ...(req.body.subRecipeId ? { subRecipeId: req.body.subRecipeId, productId: null } : { productId, subRecipeId: null }),
        description,
        unitOfMeasurement,
        quantityUnitOfMeasurement: parseFloat(quantityUnitOfMeasurement),
        quantity: parseFloat(quantityUnitOfMeasurement),
        cost: cost,
      };
      await db.collection("ingredients").doc(id).update(updatedIng);

      // Calcular y actualizar costo total de la receta
      const ingSnapshot = await db.collection("ingredients")
        .where("recipeId", "==", recipeId)
        .get();
      let totalCost = 0;
      ingSnapshot.docs.forEach((d) => {
        totalCost += parseFloat(d.data().cost || 0);
      });

      const totalWeightGrams = await calculateTotalWeight(recipeId);

      await db.collection("recipes").doc(recipeId).update({
        cost: totalCost,
        profit: totalCost * 0.3,
        price: totalCost * 1.3,
        weight: totalWeightGrams,
      });

      res.json({ success: true, ingredient: { idIngredient: id, ...updatedIng } });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/ingredient/:id", async (req, res, next) => {
    try {
      const doc = await db.collection("ingredients").doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Ingrediente no encontrado" });
      }
      res.json({
        success: true,
        ingredient: { idIngredient: doc.id, ...doc.data() },
      });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/ingredient/delete/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const doc = await db.collection("ingredients").doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Ingrediente no encontrado" });
      }
      const data = doc.data();
      const recipeId = data.recipeId;
      
      await db.collection("ingredients").doc(id).delete();

      // Recalcular y actualizar costo total de la receta
      const ingSnapshot = await db.collection("ingredients")
        .where("recipeId", "==", recipeId)
        .get();
      let totalCost = 0;
      ingSnapshot.docs.forEach((d) => {
        totalCost += parseFloat(d.data().cost || 0);
      });

      const totalWeightGrams = await calculateTotalWeight(recipeId);

      await db.collection("recipes").doc(recipeId).update({
        cost: totalCost,
        profit: totalCost * 0.3,
        price: totalCost * 1.3,
        weight: totalWeightGrams,
      });

      res.json({ success: true, message: "Ingrediente eliminado", newTotalCost: totalCost });
    } catch (err) {
      next(err);
    }
  });

  // --- Endpoints de Unidades de Medida ---
  app.get(["/api/unit", "/api/unit/"], async (req, res, next) => {
    try {
      const snapshot = await db.collection("units").get();
      let units = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (units.length === 0) {
        const defaultUnits = [
          { name: "Gramos" },
          { name: "Kilogramos" },
          { name: "Unidades" },
          { name: "Mililitros" },
          { name: "Litros" },
          { name: "Libras" },
        ];
        for (const u of defaultUnits) {
          const ref = db.collection("units").doc();
          await ref.set(u);
          units.push({ id: ref.id, ...u });
        }
      }
      res.json({ success: true, unitOf: units });
    } catch (err) {
      next(err);
    }
  });
};


// const { Router } = require("express");
// const { db } = require("../firebase");
// const router = Router();

// router.post("/id/:id", async (req, res) => {
//   const doc = await db.collection("recipes").doc(req.params.id).get();
//   const { ingredients, cost_of_production, profit, retail_price, name } =
//     doc.data();
//   const list = [];
//   let item_price = 0;
//   for (let index = 0; index < ingredients.length; index++) {
//     const id = ingredients[index];
//     console.log(id);
//     let doc = await db.collection("ingredients").doc(id).get();
//     const { price, ...restOfDoc } = doc.data();
//     doc = await db.collection("products").doc(price).get();
//     const cost = doc.data().price / doc.data().quantity;
//     item_price += cost;
//     list.push({
//       name: restOfDoc.name,
//       quantity: restOfDoc.quantity,
//       price: cost,
//     });
//   }

//   res.json({
//     recipes: {
//       id: doc.id,
//       name,
//       ingredients: list,
//       cost_of_production: item_price,
//     },
//   });
// });

// router.post("/new_products", async (req, res) => {
//   const { list_products } = req.body;
//   console.log(list_products);
//   let colRef = db.collection("products");
//   var batch = db.batch();
//   list_products.forEach((product) => {
//     var id = db.collection(`products`).doc().id;
//     let ref = colRef.doc(`${id}`);
//     const { coin, name, price, quantity } = product;
//     batch.set(ref, {
//       coin,
//       name,
//       price,
//       quantity,
//     });
//   });
//   await batch.commit();

//   res.json();
// });

// router.post("/new", async (req, res) => {
//   const { name, list_ingredients, cost_of_production, profit, retail_price } =
//     req.body;

//   // const querySnapshot = await db.collection('recipes').get()

//   // const recipes = querySnapshot.docs.map(doc => ({
//   //     id: doc.id,
//   //     ...doc.data()
//   // }))

//   let ingredients = [];
//   // console.log(recipes)
//   //   ingredients = await list_ingredients.map(async (ingredient) => {
//   //     const { name, quantity, price } = ingredient;
//   //     console.log(name);
//   //     const newItem = await db.collection("ingredients").add({
//   //       name,
//   //       quantity,
//   //       price,
//   //     });
//   //     return newItem.id
//   //     //     ingredients.push(newItem.id)
//   //     // });
//   //   });
//   let colRef = db.collection("ingredients");
//   var batch = db.batch();

//   list_ingredients.forEach((ingredient) => {
//     console.log(ingredient);
//     var id = db.collection(`ingredients`).doc().id;
//     ingredients.push(id);
//     let ref = colRef.doc(`${id}`);
//     const { name, quantity, price } = ingredient;
//     batch.set(ref, {
//       name,
//       quantity,
//       price,
//     });
//   });

//   await batch.commit();

//   console.log(ingredients);
//   // console.log("Last");

//   const recipes = await db.collection("recipes").add({
//     name,
//     ingredients,
//     cost_of_production,
//     profit,
//     retail_price,
//   });

//   res.json(0);
// });

// module.exports = router;
