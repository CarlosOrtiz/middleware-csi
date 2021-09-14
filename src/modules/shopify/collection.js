'use strict'
const { response } = require('express')
const { GET, POST, DELETE_SMART } = require('../../../@common/util/httpRequest.util')
const { USERNAME_SHOPIFY, PASSWORD_SHOPIFY, NAME_SHOP } = process.env

class ShopifyCollection {

  static async getAllCollections() {
    const { custom_collections } = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/custom_collections.json`
    )
    return { custom_collections }
  }

  static async getByIdCollection(collection_id) {
    const { custom_collection } = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/custom_collections/${collection_id}.json`
    )
    return { custom_collection }
  }

  static async saveCollection(name) {
    try {
      const _data = JSON.stringify({ "custom_collection": { "title": `${name}` } })
      const { data } = await POST(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/custom_collections.json`,
        {
          'Content-Type': 'application/json',
          'Cookie': '_y=a3aff13b-75be-42ae-bd44-b233786f6415 _shopify_y=a3aff13b-75be-42ae-bd44-b233786f6415 _shopify_fs=2021-02-24T19%3A27%3A16Z _s=143aec48-1a5f-4b86-a736-286fed48d97e _shopify_s=143aec48-1a5f-4b86-a736-286fed48d97e'
        },
        _data
      )
      return { data: data.custom_collection }
    } catch (err) {
      return { statusCode: 400, err }
    }
  }

  static async joinProductCollection(product_id, collection_id) {
    // this is for create to collect, to collect is father and the child is collections
    try {
      const _data = JSON.stringify({ "collect": { "product_id": `${product_id}`, "collection_id": `${collection_id}` } })
      console.log(_data)
      const { data } = await POST(
        `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/collects.json`,
        {
          'Content-Type': 'application/json',
          'Cookie': '_y=a3aff13b-75be-42ae-bd44-b233786f6415 _shopify_y=a3aff13b-75be-42ae-bd44-b233786f6415 _shopify_fs=2021-02-24T19%3A27%3A16Z _s=a57d5dbe-2809-4cfb-af4b-adfd0876c3c6 _shopify_s=a57d5dbe-2809-4cfb-af4b-adfd0876c3c6'
        },
        _data
      )
      console.log(data)

      return { data: data.collect }
    } catch (err) {
      return { statusCode: 400, name: err.errors, err }
    }
  }

  static async getProductInCollection(collection_id) {
    const { products } = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/collections/${collection_id}/products.json`
    )
    return { products }
  }

  static async getAllSmartCollections() {
    const { smart_collections } = await GET(
      `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/smart_collections.json`
    )
    return { smart_collections }
  }

  static async createSmartCollections(name) {
    let title = '', type = false, _data = {}, response = [], smart = {}

    if (name === 'ropa de niñ')
      title = "ROPA INFANTIL", type = true
    else if (name === 'ropa de niña')
      title = "ROPA INFANTIL", type = true
    else if (name === 'ropa de niño')
      title = "ROPA INFANTIL", type = true
    else
      title = name.toUpperCase()

    try {

      const { smart_collections } = await GET(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/smart_collections.json`)

      smart = smart_collections.find(value => value.title.toUpperCase() === title.toUpperCase())

      if (smart) {
        console.log('-> SMART COLLECTION FOUND:', title, '-', smart.title.toUpperCase())
      } else {
        console.log('\n-> CREATE SMART COLLECTION:', title, 'IS CHILDISH:', type)

        if (type) {
          _data = JSON.stringify({ "smart_collection": { "title": title.toUpperCase(), "rules": [{ "column": "tag", "relation": "equals", "condition": "ropa de niña" }, { "column": "tag", "relation": "equals", "condition": "ropa de niño" }] } });
        } else {
          _data = JSON.stringify({ "smart_collection": { "title": title.toUpperCase(), "rules": [{ "column": "tag", "relation": "equals", "condition": name }] } })
        }

        const { data } = await POST(
          `https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/smart_collections.json`,
          {
            'Content-Type': 'application/json',
            'Cookie': '_y=a3aff13b-75be-42ae-bd44-b233786f6415 _shopify_y=a3aff13b-75be-42ae-bd44-b233786f6415 _shopify_fs=2021-02-24T19%3A27%3A16Z _s=f5cec56f-f6fe-4800-bf01-ea0fc75a73cb _shopify_s=f5cec56f-f6fe-4800-bf01-ea0fc75a73cb'
          },
          _data
        )

        console.log('-> TAG WAS CREATED:', data.smart_collection.handle)
        response.push(data.smart_collection)
      }

      return { response }
    } catch (err) {
      return { statusCode: 400, err }
    }
  }
}

module.exports = ShopifyCollection