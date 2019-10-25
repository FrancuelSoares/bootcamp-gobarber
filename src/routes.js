const { Router } = require("express");

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ msg: "Olá Mundo!" });
});

module.exports = routes;