'use strict'
const log = console.log
require('dotenv').config({ path: '.env' })
const { shopifyGetAllProduts, shopifyUpdateProduct, shopifyUpdateVariant } = require('../shopify/product')
const { getProductsSiesa, searchProductsSiesa } = require('../erp/products')

class SyncProductUpdate {
  static async updateProducts() {
    if (process.env.NODE_ENV == 'local') log(`URL: ${process.env.APP_HOST_SERVER}:${process.env.APP_PORT}/update/product...\n`)
    else
      log(`URL: ${process.env.APP_HOST_CLIENT}/update/product...\n`)

    try {
      const variantShopify = [], productsToUpdate = [], arrProduct = [], arrVariant = [], _Handle = [], _options = []
      let state = 'active', arrTags = []

      const productShopify = await shopifyGetAllProduts()
      const { productsSiesa } = await getProductsSiesa();

      for (const product of productShopify) {
        for (const variant of product.variants) {
          variantShopify.push({
            idProduct: product.id,
            idVariant: variant.id,
            sku: variant.sku
          })
        }
      }

      for (const value of productsSiesa) _Handle.push(value.Handle)
      const isHandle = [...new Set(_Handle)]
      for (const value of isHandle) {
        let options = await getAllTags(value)
        _options.push(options)
      }

      for (const value of productsSiesa) {
        variantShopify.filter(element => element.sku == value.VariantSKU ?
          productsToUpdate.push({
            idProduct: element.idProduct,
            idVariant: element.idVariant,
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
            disponible: value.disponible
          }) : '')
      }

      for (const value of _options) {
        for (const tag of value._ArrTags) {
          arrTags.push({
            variantSKU: tag.variantSKU,
            tag: `${tag.tag},${value.color},${value.clothingSize}`
          })
        }
      }

      log('Number of products to update:', productsToUpdate.length)

      const auxDataproductsToUpdate = [], dataProductsToUpdate = []
      //process to update products
      for (const value of productsToUpdate) {
        if (value.Estado_Publicacion == 'Borrador')
          state = 'draft'
        else if (value.Estado_Publicacion == 'Activo')
          state = 'active'

        arrTags.filter(element => element.variantSKU.includes(value.VariantSKU) ?
          auxDataproductsToUpdate.push(
            JSON.stringify({
              id: value.idProduct,
              title: value.Title,
              body_html: value.BodyHTML,
              vendor: process.env.VENDER_NAME || 'eltemplodelamoda',
              product_type: value.Type,
              tags: `${element.tag},${value.VariantSKU.split('-')[0]}`,
              status: state,
              published: state === 'active' ? true : false
            })
          ) : ' ')
      }

      const auxUniqueDataProductsToUpdate = [...new Set(auxDataproductsToUpdate)]
      for (const value of auxUniqueDataProductsToUpdate) dataProductsToUpdate.push(JSON.parse(value))

      // update product
      log('product update process')
      const responseProductUpdate = await updateProduct(dataProductsToUpdate)

      //update variants
      log('variant update process')
      const responseVarinatUpdate = await updateVariant(productsToUpdate)

      log('\nSUCCESS: OK', '\n')
      return {
        count: {
          productShopify: productShopify.length,
          variantShopify: variantShopify.length,
          responseProductUpdate: responseProductUpdate.length,
          responseVarinatUpdate: responseVarinatUpdate.length
        },
        responseProductUpdate,
        responseVarinatUpdate
      }
    } catch (error) {
      return error
    }
  }
}

const updateVariant = async (variants, variantsUpdated = []) => {
  const nextProduct = variants.shift();
  if (nextProduct) {
    try {
      const { data } = await shopifyUpdateVariant(nextProduct, nextProduct.idVariant)
      console.log('id:', data.id, ' title:', data.title);
      variantsUpdated.push(data);
      return updateVariant(variants, variantsUpdated);
    } catch (error) {
      return updateVariant(variants, variantsUpdated);
    }
  }

  return Promise.resolve(variantsUpdated);
}

const updateProduct = async (products, productsUpdated = []) => {
  const nextProduct = products.shift();

  if (nextProduct) {
    try {
      const { data } = await shopifyUpdateProduct(nextProduct, nextProduct.id)
      console.log('id:', data.product.id, ' title:', data.product.title);
      productsUpdated.push(data.product);
      return updateProduct(products, productsUpdated);
    } catch (error) {
      return updateProduct(products, productsUpdated);
    }
  }

  return Promise.resolve(productsUpdated);
}

const getAllTags = async (searchHandle) => {
  const { response } = await searchProductsSiesa(`${searchHandle}-null-null`);
  const TypeCollection = { MENS_CLOTHING: 'Ropa de Hombre', WOMENSWEAR: 'Ropa de Mujer', GIRL_CLOTHES: 'Ropa de Niña', KID_CLOTHES: 'Ropa de Niño' }
  const _Color = [], _ClothingSize = [], option = [], _ArrTags = []
  let mainTag = '', state = 'active', collection = '', transformTitleTag = '', subCollections = 'DESCUENTOS,MAS_VENDIDOS,NUEVO_LANZAMIENTO',
    foundMan = [], foundWoman = [], foundGirl = [], foundBoy = [], foundGal = [], foundChild = [], foundLady = [], color = [], clothingSize = []

  for (const value of response) {

    if (value.FlagSocioE === 'SI' && value.FlagAlDetal === 'NO' && value.FlagMayorista === 'NO')
      mainTag = 'SocioE'
    else if (value.FlagAlDetal === 'SI' && value.FlagSocioE === 'NO' && value.FlagMayorista === 'NO')
      mainTag = 'AlDetal'
    else if (value.FlagMayorista === 'SI' && value.FlagSocioE === 'NO' && value.FlagAlDetal === 'NO')
      mainTag = ' '
    else if (value.FlagSocioE === 'SI' && value.FlagAlDetal === 'SI' && value.FlagMayorista === 'SI')
      mainTag = 'SocioE,AlDetal,'
    else if (value.FlagSocioE === 'NO' && value.FlagAlDetal === 'SI' && value.FlagMayorista === 'SI')
      mainTag = 'AlDetal'
    else if (value.FlagSocioE === 'SI' && value.FlagAlDetal === 'NO' && value.FlagMayorista === 'SI')
      mainTag = 'SocioE'
    else if (value.FlagSocioE === 'SI' && value.FlagAlDetal === 'SI' && value.FlagMayorista === 'NO')
      mainTag = 'SocioE,AlDetal'
    else if (value.FlagSocioE === 'NO' && value.FlagAlDetal === 'NO' && value.FlagMayorista === 'NO')
      mainTag = '', state = 'archived'
    else if (value.FlagSocioE.trim() === "" && value.FlagAlDetal.trim() === "" && value.FlagMayorista.trim() === "")
      mainTag = ''
    else
      mainTag = ''

    switch (value.Coleccion) {
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
        if (value.Coleccion.trim() === "" && value.Tags.trim() === "") {
          transformTitleTag = value.Title.split('')

          foundMan = await transformTitleTag.filter(element => element.toLowerCase().includes('hombre'))
          foundWoman = await transformTitleTag.filter(element => element.toLowerCase().includes('mujer'))
          foundLady = await transformTitleTag.filter(element => element.toLowerCase().includes('dama'))
          foundChild = await transformTitleTag.filter(element => element.toLowerCase().includes('nino'))
          foundBoy = await transformTitleTag.filter(element => element.toLowerCase().includes('niño'))
          foundGal = await transformTitleTag.filter(element => element.toLowerCase().includes('nina'))
          foundGirl = await transformTitleTag.filter(element => element.toLowerCase().includes('niña'))

          collection = `${foundMan[0]} ${foundWoman[0]} ${foundLady[0]} ${foundChild[0]} ${foundBoy[0]} ${foundGal[0]} ${foundGirl[0]},`
          state = 'archived'
        } else {
          transformTitleTag = value.Title.split('')

          foundMan = await transformTitleTag.filter(element => element.toLowerCase().includes('hombre'))
          foundWoman = await transformTitleTag.filter(element => element.toLowerCase().includes('mujer'))
          foundLady = await transformTitleTag.filter(element => element.toLowerCase().includes('dama'))
          foundChild = await transformTitleTag.filter(element => element.toLowerCase().includes('nino'))
          foundBoy = await transformTitleTag.filter(element => element.toLowerCase().includes('niño'))
          foundGal = await transformTitleTag.filter(element => element.toLowerCase().includes('nina'))
          foundGirl = await transformTitleTag.filter(element => element.toLowerCase().includes('niña'))

          collection = `${foundMan[0]} ${foundWoman[0]} ${foundLady[0]} ${foundChild[0]} ${foundBoy[0]} ${foundGal[0]} ${foundGirl[0]},`
          state = 'archived'
        }
        state = 'archived'
        break
    }

    if (value.Subcolecciones != 'Todos')
      subCollections = await value.Subcolecciones

    let auxTags = []
    let tag = value.Tags.split(',')

    for (const value of tag) {
      auxTags.push(value.trim())
    }

    _ArrTags.push({
      variantSKU: value.VariantSKU,
      tag: `${collection.toLowerCase()},${mainTag},${auxTags},${subCollections.trim().toLowerCase()}`
    })

    _Color.push(value.Option1Value.toString().toUpperCase())
    _ClothingSize.push(value.Option2Value.toString().toUpperCase())
  }

  color = [...new Set(_Color)]
  clothingSize = [...new Set(_ClothingSize)]

  option.push({ options: [{ name: 'Color', values: color }, { name: 'Talla', values: clothingSize }] })

  return { option, color, clothingSize, _ArrTags }
}

module.exports = SyncProductUpdate