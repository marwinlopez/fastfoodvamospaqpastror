const axios = require('axios');

const api = axios.create({
    baseURL:'https://api.exchangedyn.com/markets/quotes/usdves/',
});

const getExchangeBCV = async () => {
   const resp = await api.get('/bcv')
   const {data} = await resp
   return data
}
const getExchangeDT = async () => {
   const resp = await api.get('/dolartoday')
   const {data} = await resp
   return data
}
const apis = {
    getExchangeBCV,
    getExchangeDT
}

module.exports = {apis};