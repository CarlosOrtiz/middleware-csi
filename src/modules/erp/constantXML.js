"use strict";
const he = require('he')
require('dotenv').config({ path: '.env' })

const QUERY_STOCK_XML = (id, color, size) => ({
  xml: `<Consulta><NombreConexion>Real-Prueba</NombreConexion><IdCia>1</IdCia><IdProveedor>OK</IdProveedor><IdConsulta>CONSULTA_STOCK_XPORTAFOLIO</IdConsulta><Usuario>unoee</Usuario><Clave>805027653</Clave><Parametros><cia>1</cia><portafolio>ECOMMERCE</portafolio><bodega>${process.env.ERP_CELLAR}</bodega><reserva>${process.env.ERP_RESERVE}</reserva><referencia>${id}</referencia><color>${color}</color><talla>${size}</talla><rowid_item_ext>null</rowid_item_ext></Parametros></Consulta>`})

const QUERY_ITEMS_XML = (id, color, size) => ({
  xml: `<Consulta><NombreConexion>Real-Prueba</NombreConexion><IdCia>1</IdCia><IdProveedor>OK</IdProveedor><IdConsulta>CONSULTA_ITEMS_XPORTAFOLIO</IdConsulta><Usuario>unoee</Usuario><Clave>805027653</Clave><Parametros><cia>1</cia><portafolio>ECOMMERCE</portafolio><lista_precio>1</lista_precio><referencia>${id}</referencia><color>${color}</color><talla>${size}</talla></Parametros></Consulta>`})

const CONSECUTIVE_INVOICE_XML = `
<Consulta>
  <NombreConexion>Real-Prueba</NombreConexion>
  <IdCia>2</IdCia>
  <IdProveedor>IS</IdProveedor>
  <IdConsulta>FACTURA_CONSECUTIVO</IdConsulta>
  <Usuario>unoee</Usuario>
  <Clave>805027653</Clave>
  <Parametros>
    <notas>ACUMULACION POS</notas>
  </Parametros>
</Consulta>`

const PURCHASE_ORDERS_XML = `
<Consulta>
  <NombreConexion>Real-Prueba</NombreConexion>
  <IdCia>2</IdCia>
  <IdProveedor>IS</IdProveedor>
  <IdConsulta>ORDENES_COMPRA</IdConsulta>
  <Usuario>unoee</Usuario>
  <Clave>805027653</Clave>
  <Parametros>
    <notas>ACUMULACION POS</notas>
  </Parametros>
</Consulta>`

const QUERY_ITEMS_FULL_XML = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/"><soap:Header /><soap:Body> <tem:EjecutarConsultaXML><!-- Optional:--> <tem:pvstrxmlParametros><![CDATA[<?xml version="1.0" encoding="utf-8"?><Consulta><NombreConexion>Real-Prueba</NombreConexion><IdCia>1</IdCia><IdProveedor>OK</IdProveedor><IdConsulta>CONSULTA_ITEMS_XPORTAFOLIO</IdConsulta><Usuario>unoee</Usuario><Clave>805027653</Clave><Parametros><cia>1</cia><portafolio>ECOMMERCE</portafolio><lista_precio>1</lista_precio><referencia>120257</referencia><color>null</color><talla>null</talla></Parametros></Consulta>]]></tem:pvstrxmlParametros></tem:EjecutarConsultaXML></soap:Body></soap:Envelope>'

const options = {
  attributeNamePrefix: "_",
  attrNodeName: "attr", //default is 'false'
  textNodeName: "#text",
  ignoreAttributes: true,
  ignoreNameSpace: true, //false
  allowBooleanAttributes: true, ///false
  parseNodeValue: true,
  parseAttributeValue: true,/// false
  trimValues: true,
  cdataTagName: '__cdata', //default is 'false' __cdata
  cdataPositionChar: "\\c",
  parseTrueNumberOnly: false, ///false
  arrayMode: true, //"strict" false
  attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
  tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
  stopNodes: ["parse-me-as-string"]
};

module.exports = {
  CONSECUTIVE_INVOICE_XML,
  PURCHASE_ORDERS_XML,
  QUERY_STOCK_XML,
  QUERY_ITEMS_XML,
  options,
  QUERY_ITEMS_FULL_XML
}