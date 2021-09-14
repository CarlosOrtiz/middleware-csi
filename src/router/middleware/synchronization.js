'use strict'
require('dotenv').config()
const express = require('express')
const router = express.Router()

const { getProductsSiesa } = require('../../modules/erp/products')
const { createProducts } = require('../../modules/middleware/syncProducts')
const { addVariantProducts } = require('../../modules/middleware/syncVariants')
const { deleteVariantProducts } = require('../../modules/middleware/deleteVariants')

router.get('/get/all/products', async (req, res) => {
  const { count, productsSiesa, responseStock, responseItems } = await getProductsSiesa();
  return res.send({ count, productsSiesa })

});

router.get('/sync/product', async (req, res) => {
  const response = await createProducts()

  if (response.error)
    return res.send(response)

  return res.send(response)
});

router.get('/add/variants', async (req, res) => {
  const response = await addVariantProducts()

  if (response.error)
    return res.send(response)

  return res.send(response)
});

router.get('/delete/variants', async (req, res) => {
  const response = await deleteVariantProducts()

  if (response.error)
    return res.send(response)

  return res.send(response)
});

module.exports = router;