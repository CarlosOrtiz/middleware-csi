'use strict'
const log = console.log
require('dotenv').config()
const { saveError } = require('../data/audit')
const { shopifyDeleteVariant, shopifyGetAllProduts } = require('../shopify/product')

class SyncDeleteVariants {
  static async deleteVariantProducts() {
    const allVariantsDefault = []
    const responseShopify = await shopifyGetAllProduts()

    for (const product of responseShopify) {
      for (const variant of product.variants) {
        if (variant.sku === 'Defaul') {
          log(product.variants.length)
          if (product.variants.length >= 2) {
            log(variant.sku, product.id)
            allVariantsDefault.push({
              id: product.id,
              sku: variant.sku,
              title: product.title,
              variant_id: variant.id,
              handle: product.handle.split('-')[0].toUpperCase()
            })
          }
        }
      }
    }

    return await deleteVariants(allVariantsDefault);
  }
}

const deleteVariants = async (products, response = []) => {
  const nextProduct = products.shift();

  if (nextProduct) {
    try {
      await shopifyDeleteVariant(nextProduct.id, nextProduct.variant_id)
      console.log(nextProduct.id, 'DELETE...');
      response.push(nextProduct.id);
      return deleteVariants(products, response);
    } catch (error) {
      await saveError('VARIANT_NOT_ADDED', error, 'DELETE_VARIANTS');
      return deleteVariants(products, response);
    }
  }

  return Promise.resolve(response);
}

module.exports = SyncDeleteVariants