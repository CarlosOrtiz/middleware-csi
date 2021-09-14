'use strict';
const soap = require('soap')
const axios = require('axios')
const parser = require('fast-xml-parser')
const { options } = require('../erp/constantXML')

class QueryERP {

  static async queryERP(stringXml) {
    try {
      const response = []
      const config = {
        method: 'get',
        headers: { 'Content-Type': 'text/xml' },
        url: `${process.env.URL_QUERY_XML}${stringXml}`,
      }
      const { data } = await axios(config)
      const { DataSet } = parser.parse(await data, options, true)

      for (const value of DataSet) {
        for (const item of value.diffgram) {
          for (const item2 of item.NewDataSet) {
            for (const item3 of item2.Resultado) {
              response.push(item3)
            }
          }
        }
      }

      return { response }
    } catch (error) {
      console.log(error)
      console.log('ERROR DEL METODO XML:', error.message)
      return { status: 404, error, message: error.message }
    }
  }

  static async methodERP() {
    const url = process.env.URL_ERP
    const args = {
      xml: '<?xml version="1.0" encoding="utf- 8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/"><soap:Header /><soap:Body> <tem:EjecutarConsultaXML><!-- Optional:--> <tem:pvstrxmlParametros><![CDATA[<?xml version="1.0" encoding="utf-8"?><Consulta><NombreConexion>Real-Prueba</NombreConexion><IdCia>1</IdCia><IdProveedor>OK</IdProveedor><IdConsulta>CONSULTA_ITEMS_XPORTAFOLIO</IdConsulta><Usuario>unoee</Usuario><Clave>805027653</Clave><Parametros><cia>1</cia><portafolio>ECOMMERCE</portafolio><lista_precio>1</lista_precio><referencia>120257</referencia><color>null</color><talla>null</talla></Parametros></Consulta>]]></tem:pvstrxmlParametros></tem:EjecutarConsultaXML></soap:Body></soap:Envelope>'
    }

    return await new Promise(async (resolve, reject) => {
      soap.createClient(url, (error, client) => {
        if (error) {
          console.log('err', error)
          reject(error);
        }

        console.log('\nEjecutarConsultaXML', client.describe().WSUNOEE.WSUNOEESoap.EjecutarConsultaXML)

        client.EjecutarConsultaXML(args.xml, (error, response) => {
          console.log('\n', error)
          console.log('\nResponse:', response)
          resolve(response)
        })
      })
    })
  }
}

module.exports = QueryERP;