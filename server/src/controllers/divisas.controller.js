const { apis } = require("../api");
const { db } = require("../firebase");

exports.create = (req, res) => {
  const { body } = req;
  const { name } = body;
  console.log(body);

  db.collection("divisas")
    .doc(name)
    .set(body)
    .then(() => {
      res.status(202).json({ message: "Registro actualizado" });
    })
    .catch(() => {
      res.status(400).json({ message: "Error no se actualizo el registro" });
    });
};

exports.filter = async (req, res) => {
  const { filter } = req.body;
  const divisaRef = db.collection("divisas");

  const querySnapshot = await divisaRef.doc(filter).get();

  const tempDoc = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, ...data };
  });

  res.json({ data: tempDoc });
};

exports.getParalelo = async (req, res) => {
  const divisaRef = db.collection("divisas");

  const querySnapshot = await divisaRef.where("name", "==", "DolarToday").get();

  const tempDoc = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, ...data };
  });

  res.json(tempDoc);
};

exports.updateExchange = async (req, res) => {
  const exchangeBCV = await apis.getExchangeBCV();
  const { BCV } = exchangeBCV.sources;
  const exchangeDT = await apis.getExchangeDT();
  const { DolarToday } = exchangeDT.sources;
  res.status(202).json({
    message: "Se actualizo la tasa de cambio",
    tasa: [
      {
        sources: "BCV",
        quote: BCV.quote,
      },
      {
        sources: "DolarToday",
        quote: DolarToday.quote,
      },
    ],
  });
};
