'use strict'
const log = console.log
const { saveError } = require('../data/audit')
const { getProductsSiesa } = require('../erp/products')
const { createSmartCollections } = require('../shopify/collection')
const { shopifyCreateProduct, shopifyGetAllProduts } = require('../shopify/product')

class SyncProducts {

  static async createProducts() {
    const auxDataProducts = [], dataProducts = [], products = [], productsShopify = [], allCollection = [], allProducts = []
    const { productsSiesa } = await getProductsSiesa(); // Base de datos
    const responseShopify = await shopifyGetAllProduts(); // fron

    for (const product of responseShopify) {
      productsShopify.push({
        id: product.id,
        title: product.title,
        handle: product.handle
      })
    }

    log('variants found:', productsSiesa.length)

    for (const value of productsSiesa) auxDataProducts.push(
      JSON.stringify({
        Handle: value.Handle,
        Title: value.Title,
        BodyHTML: value.BodyHTML,
        Type: value.Type,
        Tags: value.Tags,
        FlagSocioE: value.FlagSocioE,
        FlagAlDetal: value.FlagAlDetal,
        FlagMayorista: value.FlagMayorista,
        Coleccion: value.Coleccion,
        Subcolecciones: value.Subcolecciones,
        Estado_Publicacion: value.Estado_Publicacion
      }))

    const auxUniqueDatasameVariants = [...new Set(auxDataProducts)]

    for (const value of auxUniqueDatasameVariants) dataProducts.push(JSON.parse(value))

    for (const value of dataProducts) {
      let isProduct = productsShopify.find(element => element.title === value.Title)
      if (!isProduct)
        products.push(value)
    }

    log('data products:', dataProducts.length)
    log('products to create:', products.length, '\n')

    if (products.length === 0)
      return { error: 'NOT_NEW_PRODUCTS', detail: 'No hay nuevos productos.' }

    const productsNormalized = normalizeProductsCreateShopify(products);

    for (const product of productsNormalized) {
      for (const nameCollection of product.collection) {
        allCollection.push(nameCollection)
      }
    }

    for (const product of productsNormalized) allProducts.push(product.data)

    const uniqueCollection = [...new Set(allCollection)]

    for (const value of uniqueCollection) await createSmartCollections(value)

    return await createProducts(allProducts);
  }
}

const createProducts = async (products, productsCreated = []) => {
  const nextProduct = products.shift();

  if (nextProduct) {
    try {
      const { data } = await shopifyCreateProduct(nextProduct)
      console.log(data.product.id);
      productsCreated.push(data.product);
      return createProducts(products, productsCreated);
    } catch (error) {
      await saveError('SKU_NOT_FOUND', error, 'SYNC_PRODUCTS');
      return createProducts(products, productsCreated);
    }
  }

  return Promise.resolve(productsCreated);
}

const normalizeProductsCreateShopify = (products) => {

  let mainTag = ' ', subCollections = ' ', collection = '', state = 'active'
  const TypeCollection = { MENS_CLOTHING: 'Ropa de Hombre', WOMENSWEAR: 'Ropa de Mujer', GIRL_CLOTHES: 'Ropa de Niña', KID_CLOTHES: 'Ropa de Niño' }

  if (products.length == 0) { return }

  return products.map(product => {
    if (product.FlagSocioE === 'SI' && product.FlagAlDetal === 'NO' && product.FlagMayorista === 'NO')
      mainTag = 'SocioE'
    else if (product.FlagAlDetal === 'SI' && product.FlagSocioE === 'NO' && product.FlagMayorista === 'NO')
      mainTag = 'AlDetal'
    else if (product.FlagMayorista === 'SI' && product.FlagSocioE === 'NO' && product.FlagAlDetal === 'NO')
      mainTag = 'Mayorista'
    else if (product.FlagSocioE === 'SI' && product.FlagAlDetal === 'SI' && product.FlagMayorista === 'SI')
      mainTag = 'SocioE, AlDetal, Mayorista'
    else if (product.FlagSocioE === 'NO' && product.FlagAlDetal === 'SI' && product.FlagMayorista === 'SI')
      mainTag = 'AlDetal, Mayorista'
    else if (product.FlagSocioE === 'SI' && product.FlagAlDetal === 'NO' && product.FlagMayorista === 'SI')
      mainTag = 'SocioE, Mayorista'
    else if (product.FlagSocioE === 'SI' && product.FlagAlDetal === 'SI' && product.FlagMayorista === 'NO')
      mainTag = 'SocioE, AlDetal'

    switch (product.Coleccion) {
      case TypeCollection.MENS_CLOTHING:
        collection = TypeCollection.MENS_CLOTHING.toLowerCase()
        break
      case TypeCollection.WOMENSWEAR:
        collection = TypeCollection.WOMENSWEAR.toLowerCase()
        break
      case TypeCollection.GIRL_CLOTHES:
        collection = TypeCollection.GIRL_CLOTHES.toLowerCase()
        break
      case TypeCollection.KID_CLOTHES:
        collection = TypeCollection.KID_CLOTHES.toLowerCase()
        break
      default:
        console.log('none')
        break
    }

    if (product.Subcolecciones === 'Todos') subCollections = 'DESCUENTOS,MAS_VENDIDOS,NUEVO_LANZAMIENTO'
    else
      subCollections = product.Subcolecciones

    if (product.Estado_Publicacion == 'Borrador')
      state = 'draft'
    else if (product.Estado_Publicacion == 'Activo')
      state = 'active'

    return {
      collection: [collection.toLowerCase(), subCollections.toLowerCase()],
      data: {
        'product': {
          'title': product.Title,
          'body_html': product.BodyHTML,
          'vendor': process.env.VENDER_NAME,
          'handle': product.Handle,
          'product_type': product.Type,
          'tags': `${collection.toLowerCase()},${mainTag},${subCollections.trim().toLowerCase()},${product.Handle}`,
          'status': state,
          'variants': [{
            'title': 'Defaul / D',
            'price': '18900.00',
            'sku': 'Defaul',
            'position': 1,
            'inventory_policy': 'deny',
            'compare_at_price': null,
            'fulfillment_service': 'manual',
            'inventory_management': 'shopify',
            'option1': 'Defaul',
            'option2': 'D',
            'option3': null,
            'taxable': true,
            'barcode': '',
            'requires_shipping': true
          }],
          'options': [
            {
              'name': 'Color',
              'values': [
                'Defaul'
              ]
            },
            {
              'name': 'Talla',
              'values': [
                'D'
              ]
            }
          ]
        }
      }

    }
  });
}

module.exports = SyncProducts