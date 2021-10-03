'use strict'
const { saveError } = require('../data/audit');
const { shopifyGetAllProduts, addDefaulVar } = require('../shopify/product')

class addDefaultVariant {

  static async addDefaultVariant() {
    let response = [];
    const responseShopify = await shopifyGetAllProduts();

    for (const product of responseShopify) {
      response.push({
        id: product.id,
        title: product.title,
        handle: product.handle
      })
    }

    return await addVariant(response);
  }
}

const addVariant = async (variant, variantCreated = []) => {
  const nextVariant = variant.shift();

  if (nextVariant) {
    try {
      const { data } = await addDefaulVar(nextVariant.id);
      console.log(data.product.id);
      variantCreated.push(data.product);
      return addVariant(variant, variantCreated);
    } catch (error) {
      await saveError('VARIANT_NOT_EXIST', error, 'ADD_DEFAULT_VARIABLE');
      return addVariant(variant, variantCreated);
    }
  }

  return Promise.resolve(variantCreated);
}

module.exports = addDefaultVariant