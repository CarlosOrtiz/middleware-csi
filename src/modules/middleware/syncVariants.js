'use strict'
const log = console.log
require('dotenv').config()
const { saveError } = require('../data/audit')
const { getProductsSiesa } = require('../erp/products')
const { addNewVariant, shopifyDeleteProduct, shopifyGetAllProduts } = require('../shopify/product')

class SyncVariants {
  static async addVariantProducts() {
    const shopifyProducts = [], auxDataVariants = [], dataVariants = [], productsWithoutVariants = [], variants = []
    const { productsSiesa } = await getProductsSiesa();
    const responseShopify = await shopifyGetAllProduts();

    for (const product of responseShopify) {
      for (const variant of product.variants) {
        if (variant.sku.trim() === "")
          productsWithoutVariants.push({
            id: product.id,
            sku: variant.sku,
            title: product.title,
            handle: product.handle.split('-')[0].toUpperCase()
          })
        else
          shopifyProducts.push({
            id: product.id,
            sku: variant.sku,
            title: product.title,
            handle: product.handle.split('-')[0].toUpperCase()
          })
      }
    }

    //create metho for delete products with stock in 0
    if (productsWithoutVariants.length > 0) {
      console.log('Prodcuts to delete')
      await deleteProducts(productsWithoutVariants)
    }

    for (const value of productsSiesa) shopifyProducts.filter(element => element.handle == value.Handle ?
      auxDataVariants.push(
        JSON.stringify({
          product_id: element.id,
          Handle: value.Handle,
          Title: value.Title,
          BodyHTML: value.BodyHTML,
          Type: value.Type,
          Tags: value.Tags,
          Option1Value: value.Option1Value,
          Option2Value: value.Option2Value,
          VariantSKU: value.VariantSKU,
          VariantPrice: value.VariantPrice,
          GiftCard: value.GiftCard,
          FlagSocioE: value.FlagSocioE,
          FlagAlDetal: value.FlagAlDetal,
          FlagMayorista: value.FlagMayorista,
          Precio_Comparacion: value.Precio_Comparacion,
          Estado_Publicacion: value.Estado_Publicacion,
          Coleccion: value.Coleccion,
          Subcolecciones: value.Subcolecciones,
          Disponible: value.disponible
        })) : ' ')

    const auxUniqueDataSameVariants = [...new Set(auxDataVariants)]

    for (const value of auxUniqueDataSameVariants) dataVariants.push(JSON.parse(value))

    log('variants found:', dataVariants.length)

    for (const value of dataVariants) {
      let isVariant = shopifyProducts.find(element => element.sku == value.VariantSKU)
      if (!isVariant) {
        console.log('Variant not exist:', value.VariantSKU)
        variants.push(value)
      }
    }
    log('variants:', variants.length)

    return await createNewVariants(variants);
  }
}

const createNewVariants = async (variants, variantsCreated = []) => {
  const nextVariant = variants.shift();

  if (nextVariant) {
    try {
      const { data } = await addNewVariant(nextVariant.VariantSKU, nextVariant.VariantPrice, nextVariant.Precio_Comparacion, nextVariant.product_id)
      console.log(data.variant.id);
      variantsCreated.push(data.variant);
      return createNewVariants(variants, variantsCreated);
    } catch (error) {
      await saveError('VARIANT_NOT_FOUND', error, 'SYNC_VARIANT');
      return createNewVariants(variants, variantsCreated);
    }
  }

  return Promise.resolve(variantsCreated);
}

const deleteProducts = async (products, response = []) => {
  const nextProduct = products.shift();

  if (nextProduct) {
    try {
      await shopifyDeleteProduct(nextProduct.id)
      console.log(nextProduct.id, 'DELETE...');
      response.push(nextProduct.id);
      return deleteProducts(products, response);
    } catch (error) {
      await saveError('PRODUCT_NOT_FOUND', error, 'SYNC_VARIANT_DELETE_PRODUCTS');
      return deleteProducts(products, response);
    }
  }

  return Promise.resolve(response);
}

module.exports = SyncVariants