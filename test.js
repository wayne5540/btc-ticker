const WebSocket = require('ws')


const ws = require('ws')
const w = new ws('wss://api.bitfinex.com/ws/2')

w.on('message', (msg) => console.log(msg))

let msg = ({ 
  event: 'subscribe', 
  channel: 'ticker', 
  symbol: 'tBTCUSD' 
})

w.on('open', () => w.send(msg))