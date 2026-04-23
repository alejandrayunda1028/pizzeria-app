const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizza.controller');

router.get('/options', pizzaController.getOptions);

module.exports = router;