'use strict'
const log = console.log
require('dotenv').config()
const { queryERP } = require('../erp/query')
const { QUERY_ITEMS_XML, QUERY_STOCK_XML } = require('../erp/constantXML')

class Siesa {

  static async getProductsSiesa() {
    try {
      const productsSiesa = []
      const responseItems = (await queryERP(QUERY_ITEMS_XML(null, null, null).xml)).response
      const responseStock = (await queryERP(QUERY_STOCK_XML(null, null, null).xml)).response

      for (const value of responseItems) {
        if (!((value.FlagSocioE === 'NO' && value.FlagAlDetal === 'NO' && value.FlagMayorista === 'NO') || (value.FlagSocioE === '' && value.FlagAlDetal === '' && value.FlagMayorista === '')))
          responseStock.filter(element => (element.disponible > 0 && `${value.Handle}-${value.Option1Value}-${value.Option2Value}` === `${element.f120_referencia}-${element.color}-${element.talla}`) ?
            productsSiesa.push({
              Handle: value.Handle,
              Title: value.Title,
              BodyHTML: value.BodyHTML,
              Type: value.Type,
              Tags: value.Tags,
              Option1Value: value.Option1Value.toString().toUpperCase(),
              Option2Value: value.Option2Value.toString().toUpperCase(),
              VariantSKU: `${value.VariantSKU.split('-')[0]}-${element.color}-${element.talla}`,
              VariantPrice: value.VariantPrice,
              GiftCard: value.GiftCard,
              FlagSocioE: value.FlagSocioE,
              FlagAlDetal: value.FlagAlDetal,
              FlagMayorista: value.FlagMayorista,
              Precio_Comparacion: value.Precio_Comparacion || 0,
              Estado_Publicacion: value.Estado_Publicacion,
              Coleccion: value.Coleccion,
              Subcolecciones: value.Subcolecciones,
              disponible: element.disponible,
              Bodega: element.bodega
            }) : ' ')
      }

      return {
        count: {
          responseStock: responseStock.length,
          responseItems: responseItems.length,
          productsSiesa: productsSiesa.length
        },
        productsSiesa,
        responseStock: responseStock,
        responseItems: responseItems
      }

    } catch (error) {
      return error
    }
  }

  static async searchProductsSiesa(searchSku) {
    try {
      const property = searchSku.split('-'), response = [];
      const responseItems = (await queryERP(QUERY_ITEMS_XML(property[0], property[1] || null, property[2] || null).xml)).response
      const responseStock = (await queryERP(QUERY_STOCK_XML(property[0], property[1] || null, property[2] || null).xml)).response

      for (const value of responseItems) {
        if (!((value.FlagSocioE === 'NO' && value.FlagAlDetal === 'NO' && value.FlagMayorista === 'NO') || (value.FlagSocioE === '' && value.FlagAlDetal === '' && value.FlagMayorista === '')))
          responseStock.filter(element => (element.f120_referencia == value.Handle && element.color == value.Option1Value && element.talla == value.Option2Value && element.disponible > 0) ?
            response.push({
              Handle: value.Handle,
              Title: value.Title,
              BodyHTML: value.BodyHTML,
              Type: value.Type,
              Tags: value.Tags,
              Option1Value: value.Option1Value,
              Option2Value: value.Option2Value,
              VariantSKU: `${value.VariantSKU.split('-')[0]}-${element.color}-${element.talla}`,
              VariantPrice: value.VariantPrice,
              GiftCard: value.GiftCard,
              FlagSocioE: value.FlagSocioE,
              FlagAlDetal: value.FlagAlDetal,
              FlagMayorista: value.FlagMayorista,
              Precio_Comparacion: value.Precio_Comparacion || 0,
              Estado_Publicacion: value.Estado_Publicacion,
              Coleccion: value.Coleccion,
              Subcolecciones: value.Subcolecciones,
              disponible: element.disponible,
              Bodega: element.bodega
            }) : ' ')
      }
      return { response }

    } catch (error) {
      return error
    }
  }
}

module.exports = Siesa