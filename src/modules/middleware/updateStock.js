'use strict'
const { getProductsSiesa } = require('../erp/products')
const { shopifyGetAllProduts, shopifyGetInventory, shopifyRegisterInventory } = require('../shopify/product')

class UpdateStock {
  static async syncStock() {

    try {
      let inventory = [], k = 0
      const shopifyVariantsData = [], location = [], result = []
      const { productsSiesa } = await getProductsSiesa();
      const shopifyProducts = await shopifyGetAllProduts();

      for (const value of shopifyProducts) {
        for (const item of value.variants) {
          shopifyVariantsData.push({
            sku: item.sku,
            variantId: item.id,
            productId: item.product_id,
            inventoryItemId: item.inventory_item_id,
            inventory_quantity: item.inventory_quantity,
            old_inventory_quantity: item.old_inventory_quantity
          })
        }
      }

      for (const value of shopifyVariantsData) {
        productsSiesa.filter(element => (element.VariantSKU === value.sku && element.disponible != value.inventory_quantity) ?
          inventory.push({
            sku: value.sku,
            productId: value.productId,
            variantId: value.variantId,
            quantity: element.disponible,
            inventoryItemId: value.inventoryItemId
          })
          : ' ')
      }

      console.log('inventory quantity:', inventory.length)

      for (const item of inventory) {
        let responseInventoryItem = await getInventory(item.inventoryItemId)

        for (const value of responseInventoryItem.inventory_levels) {
          location.push({
            available: value.available,
            idLocation: value.location_id,
            idInventoryItem: value.inventory_item_id
          })
        }

        let dataInventory = {
          "available": parseInt(item.quantity),
          "location_id": parseInt(location[k].idLocation),
          "inventory_item_id": parseInt(location[k].idInventoryItem),
        }

        let responseUpdatedQuantity = await shopifyRegisterInventory(dataInventory)
        result.push(responseUpdatedQuantity.data)

        console.log('\ndata:', responseUpdatedQuantity.data)
        k++
      }

      console.log('\nSUCCESS: OK')
      return {
        success: 'OK',
        generalInventory: inventory.length,
        newInventory: result.length,
        response: {
          result,
          inventory
        }
      }
    } catch (error) {
      console.log(error)
      return { error: 'NOT_UPDATED_STOCK', detail: error }
    }
  }
}

const getInventory = async (id) => {
  return await shopifyGetInventory(id)
}

module.exports = UpdateStock