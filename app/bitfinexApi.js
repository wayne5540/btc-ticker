const request = require('request-promise')
const helpers = require('./helpers/helper')
const url = "https://api.bitfinex.com/v2"

// // https://bitfinex.readme.io/v2/reference#rest-public-candles
const candleObject = (rawCandleArray) => (
  {
    timestamp: rawCandleArray[0],
    open: rawCandleArray[1],
    close: rawCandleArray[2],
    highest: rawCandleArray[3],
    lowest: rawCandleArray[4],
    volumn: rawCandleArray[5]
  }
)

// https://bitfinex.readme.io/v2/reference#rest-public-ticker
const tickerObject = (rawTickerArray) => (
  {
    bid: rawTickerArray[0],
    bidSize: rawTickerArray[1],
    ask: rawTickerArray[2],
    askSize: rawTickerArray[3],
    dailyChange: rawTickerArray[4],
    dailyChangePercentage: rawTickerArray[5],
    lastPrice: rawTickerArray[6],
    volumn: rawTickerArray[7],
    highest: rawTickerArray[8],
    lowest: rawTickerArray[9]
  }
)

const getCandles = async () => {
  const candles = await request.get({
                    url: `${url}/candles/trade:1m:tBTCUSD/hist`,
                    qs: { limit: 20 },
                    json: true
                  })


  const candleObjects = candles.map((candle) => candleObject(candle))

  return candleObjects
}

const getTicker = async () => {
  const ticker = await request.get({
                    url: `${url}/ticker/tBTCUSD`,
                    json: true
                  })

  return tickerObject(ticker)
}

const getTrending = async () => {
  const candles = await getCandles()
  const ticker = await getTicker()
  const currenctPrice = ticker.lastPrice
  const highestPrice = Math.max(...candles.map((candle) => candle.highest))
  const changePercentage = ((currenctPrice - highestPrice) / currenctPrice) * 100

  return helpers.round(changePercentage, 2)
}

module.exports = {
  getCandles,
  tickerObject,
  getTrending
}

