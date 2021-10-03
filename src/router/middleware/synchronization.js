'use strict'
require('dotenv').config()
const express = require('express')
const router = express.Router()
const cron = require('node-cron')

const { getProductsSiesa } = require('../../modules/erp/products')
const { createProducts } = require('../../modules/middleware/syncProducts')
const { addVariantProducts } = require('../../modules/middleware/syncVariants')
const { deleteVariantProducts } = require('../../modules/middleware/deleteVariants')
const { syncStock } = require('../../modules/middleware/updateStock')
const { updateProducts } = require('../../modules/middleware/syncProductUpdate')

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

router.get('/update/inventory', async (req, res) => {
  const response = await syncStock()

  if (response.error)
    return res.send(response)

  return res.send(response)
});

router.get('/update/product', async (req, res) => {
  const response = await updateProducts()
  if (response.error)
    return res.send(response)

  return res.send(response)
});

//All Cron Job

//The *create new product* cron job runs every day at 2:00 a.m
cron.schedule('0 2 * * *', async () => {
  const response = await createProducts()

  if (response.error)
    return res.send(response)

  return res.send(response)
})

//The *create new product* cron job runs every day at 2:30 a.m
cron.schedule('30 2 * * *', async () => {
  const response = await addVariantProducts()

  if (response.error)
    return res.send(response)

  return res.send(response)
})

//The *create new product* cron job runs every day at 3:10 a.m
cron.schedule('10 3 * * *', async () => {
  const response = await deleteVariantProducts()

  if (response.error)
    return res.send(response)

  return res.send(response)
});

//The *inventory update* cron job runs every day at 3:20 a.m 3:20 pm 10:20 pm
cron.schedule('20 3,15,20 * * *', async () => {
  const response = await syncStock()

  if (response.error)
    return res.send(response)

  return res.send(response)
})

//The *product update* cron job runs every day at 5:00 a.m. Y 5 PM
cron.schedule('0 5,17 * * *', async () => {
  const { result } = await updateProducts()

  if (result.error)
    return res.send(result)

  return res.send(result)
})



module.exports = router;