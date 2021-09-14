'use strict'
const Shopify = require('shopify-api-node')
const { USERNAME_SHOPIFY, PASSWORD_SHOPIFY, NAME_SHOP, VERSION_API, VENDER_NAME } = process.env
const { GET, POST, PUT_SHOPIFY, DELETE, DELETE_SHOPIFY } = require('../../../@common/util/httpRequest.util');
const { getProductsSiesa } = require('../erp/products');
const shopify = new Shopify({
  shopName: NAME_SHOP,
  apiKey: USERNAME_SHOPIFY,
  password: PASSWORD_SHOPIFY
});

class ShopifyProduct {

  static async shopifyGetProduts(value) {
    const { products } = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products.json?limit=250&status=${value}`
    )
    return Promise.resolve({ products })
  }

  static async shopifyGetProdutsArchived(limit = 250, state, vendor) {
    const { products } = await GET(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products.json?limit=${limit}&status=${state}&vendor=${vendor}`)
    return Promise.resolve({ products })
  }

  static async shopifyGetAllProduts() {
    try {
      return await getAllProducts()
    } catch (error) {
      return { error }
    }
  }

  static async shopifyGetProdutsParam(since_id, limit, vendor) {
    let cant = 0
    cant = (limit > 250) ? cant = 250 : cant = limit

    const { products } = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products.json?since_id=${since_id}&vendor=${vendor}&limit=${cant}`
    )
    return Promise.resolve({ products })
  }

  static async shopifyGetById(product_id, variant_id) {
    const isProduct = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${product_id}.json`
    )

    const allVariants = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${product_id}/variants.json`
    )

    const isVariant = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/variants/${variant_id}.json`
    )

    return Promise.resolve({ isProduct, allVariants, isVariant })
  }

  static async shopifyGetVariant(product_id) {

    const isVariant = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${product_id}/variants.json?limit=250`
    )

    return Promise.resolve({ isVariant })
  }

  static async shopifyCreateProduct(_data) {
    try {

      const { data } = await POST(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products.json`,
        {
          'Content-Type': 'application/json'
        },
        _data
      )

      return Promise.resolve({ data })
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async shopifyUpdateProduct(_data, productId) {
    try {
      const auxData = JSON.stringify({
        "product": {
          "id": _data.id,
          "title": _data.title,
          "body_html": _data.body_html,
          "vendor": _data.vendor,
          "product_type": _data.product_type,
          "tags": _data.tags,
          "status": _data.status
        }
      })
      const { data } = await PUT_SHOPIFY(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${productId}.json`,
        auxData
      )
      return { data }
    } catch (err) {
      return { statusCode: 400, err }
    }
  }
  
  static async updateProductProperty(_data, productId) {
    try {

      const { data } = await PUT_SHOPIFY(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${productId}.json`,
        _data
      )

      return { data }
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async shopifyUpdateVariant(_data, variantId) {
    try {
      const auxData = JSON.stringify({
        "variant": {
          "id": _data.idVariant,
          "position": 1,
          "taxable": true,
          "sku": _data.VariantSKU,
          "requires_shipping": true,
          "price": _data.VariantPrice,
          "inventory_management": "shopify",
          "compare_at_price": _data.Precio_Comparacion || 0,
          "barcode": _data.Handle,
          "inventory_policy": "deny"
        }
      })

      const response = await PUT_SHOPIFY(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/variants/${variantId}.json`,
        auxData
      )

      return { data: response.data.variant }
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async newShopifyUpdateVariant(sku, price, comparePrice, barcode, variantId) {
    try {
      const _data = JSON.stringify({
        "variant": {
          "position": 1,
          "taxable": true,
          "sku": sku,
          "option1": sku.split('-')[1].toUpperCase(),
          "option2": sku.split('-')[2].toUpperCase(),
          "requires_shipping": true,
          "price": price,
          "inventory_management": "shopify",
          "compare_at_price": comparePrice || 0,
          "barcode": "",
          "inventory_policy": "deny"
        }
      })

      const { data } = await PUT_SHOPIFY(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/variants/${variantId}.json`,
        _data
      )

      return Promise.resolve({ data })
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async addNewVariant(sku, price, comparePrice, product_id) {
    try {
      const option = sku.split('-')
      const _data = JSON.stringify({
        "variant": {
          "sku": sku,
          "price": price,
          "taxable": true,
          "requires_shipping": true,
          "inventory_policy": "deny",
          "inventory_management": "shopify",
          "barcode": option[0].toUpperCase(),
          "option1": option[1].toUpperCase(),
          "option2": option[2].toUpperCase(),
          "compare_at_price": comparePrice || 0,
        }
      })

      const response = await POST(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${product_id}/variants.json`,
        {
          'Content-Type': 'application/json'
        },
        _data
      )

      return Promise.resolve({ data: response.data })
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async addDefaulVar(product_id) {
    try {
      const _data = JSON.stringify({
        "variant": {
          "sku": "Defaul",
          "price": "1000",
          "taxable": true,
          "requires_shipping": true,
          "inventory_policy": "deny",
          "inventory_management": "shopify",
          "barcode": "Defaul",
          "option1": "Defaul",
          "option2": "D",
          "compare_at_price": 0
        }
      });

      const response = await POST(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${product_id}/variants.json`,
        {
          'Content-Type': 'application/json'
        },
        _data
      )

      return Promise.resolve({ data: response.data })
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async searchVariantBySkuV2(sku) {
    try {
      const saveIdProduct = [], responseVariants = [], searchReference = sku.split('-')[0]
      const getAllProducts = await GET(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products.json?vendor=${VENDER_NAME}`)

      if (getAllProducts.error) return getAllProducts

      for (const value of getAllProducts.products) saveIdProduct.push(value.id)

      for (const product_id of saveIdProduct) {
        let { variants } = await GET(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${product_id}/variants.json`)

        for (const item of variants) {
          responseVariants.push({
            "id": item.id,
            "product_id": item.product_id,
            "title": item.title,
            "price": item.price,
            "handle": item.sku.split('-')[0],
            "sku": item.sku,
            "compare_at_price": item.compare_at_price,
            "option1": item.option1,
            "option2": item.option2,
            "option3": item.option3,
            "taxable": item.taxable,
            "barcode": item.barcode
          })
        }
      }

      let found = responseVariants.find(element => element.handle === searchReference)

      return Promise.resolve({ found })
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async searchProductByHandle(handle) {
    try {
      const { products } = await GET(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products.json?vendor=tmd2&handle=${handle}`)
      return Promise.resolve({ products })
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async shopifyDeleteProduct(productId) {
    try {
      return await DELETE(productId)
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async shopifyDeleteVariant(productId, variantId) {
    try {
      return await DELETE_SHOPIFY(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/${VERSION_API}/products/${productId}/variants/${variantId}.json`)
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async getCountVariants(productId) {
    return await shopify.productVariant.count(productId);
  }

  static async shopifyGetInventory(id) {
    await sleep(500);
    let { inventory_levels } = await GET(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/inventory_levels.json?inventory_item_ids=${id}`)
    return Promise.resolve({ inventory_levels })
  }

  static async shopifyRegisterInventory(dataInventory) {
    try {
      return await POST(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/inventory_levels/set.json`,
        { 'Content-Type': 'application/json' }, dataInventory)

    } catch (error) {
      return error
    }
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const getAllProducts = async () => {
  const productCount = await getCountProducts();

  let pages = Math.trunc(productCount / 250);
  if (productCount % 250) { pages++ };

  return await getProducts(pages + 1)
}

const getProducts = async (pages, productsAll = [], params = { limit: 250, vendor: process.env.VENDER_NAME }) => {
  pages--;

  if (pages) {
    try {
      const products = await shopify.product.list(params);
      params = products.nextPageParameters
      productsAll.push(...products);
      return getProducts(pages, productsAll, params);
    } catch (error) {
      console.error(error)
      return getProducts(pages, productsAll, params);
    }
  }
  return Promise.resolve(productsAll);
}

const getCountProducts = async () => await shopify.product.count();

module.exports = ShopifyProduct