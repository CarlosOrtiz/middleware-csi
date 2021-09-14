'use strict';
const axios = require('axios');
const { USERNAME_SHOPIFY, PASSWORD_SHOPIFY, NAME_SHOP } = process.env;
require('dotenv').config({ path: '.env' })

class httpRequest {

  static async GET(url, headers) {
    try {
      const response = await axios.get(url, { headers });
      return response.data
    } catch (error) {
      return {
        error: error.response.data.errors,
        message: {
          status: error.response.statusText,
          detail: error.response.data.errors,
          url: error.config.url
        }
      };
    }
  }

  static async POST(url, headers, data) {
    try {
      return await axios({ method: 'post', url, headers, data })
    } catch (error) {
      return { error }
    }
  }

  static async PUT(url, data, options) {
    try {
      const response = await axios.post(url, data, options)
      return response
    } catch (error) {
      return { error }
    }
  }

  static async DELETE(productId) {
    try {
      await axios.delete(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/products/${productId}.json`);

      return { succes: 'OK' }
    } catch (error) {
      return { error }
    }
  }

  static async DELETE_VARIANTS(variantId) {
    try {
      await axios.delete(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/products/${productId}.json`);

      return { succes: 'OK' }
    } catch (error) {
      return { error }
    }
  }

  static async DELETE_SMART(smart_collection_id) {
    try {
      await axios.delete(`https://${USERNAME_SHOPIFY}:${PASSWORD_SHOPIFY}@${NAME_SHOP}.myshopify.com/admin/api/2020-10/smart_collections/${smart_collection_id}.json`);
      return { succes: 'OK' }
    } catch (error) {
      return { error }
    }
  }

  static async PUT_SHOPIFY(url, data) {
    try {
      const config = {
        method: 'put',
        url,
        headers: {
          'Content-Type': 'application/json'
        },
        data
      };
      const response = await axios(config)

      return response
    } catch (err) {
      return { statusCode: 400, response: err }
    }
  }

  static async DELETE_SHOPIFY_WEBHOOKS(user, password, name, idWebHook) {
    const response = await axios.delete(`https://${user}:${password}@${name}.myshopify.com/admin/api/2020-10/webhooks/${idWebHook}.json`);
    return response;
  }

  static async DELETE_SHOPIFY(url) {
    try {
      await axios.delete(url);
      return { succes: 'OK' }
    } catch (error) {
      return { error }
    }
  }

}
module.exports = httpRequest;