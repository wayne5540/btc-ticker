'use strict';

const path = require('path')

const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  Notification
} = require('electron')

const {
  getCandles,
  tickerObject,
  getTrending
} = require('./bitfinexApi')

const WebSocket = require('ws')
const webSocket = new WebSocket('wss://api.bitfinex.com/ws/2')


let tray = null
let notification = null


const creatTray = () => {
  tray = new Tray(path.join(__dirname, 'bitcoin-logo-16.png'))
  tray.setToolTip('24hrs % changes / BTC price')

  if (Notification.isSupported()) {
    setInterval(checkTrending, 60000)
  }


  let msg = ({
    event: 'subscribe',
    channel: 'ticker',
    symbol: 'tBTCUSD'
  })

  webSocket.on('open', () => webSocket.send(JSON.stringify(msg)))
}

const checkTrending = () => {
  getTrending().then((trending) => {
    if (trending > 0) {
      showNotification("Price Rising!", `${trending}% since last 20 mins`)
    }

    if (trending < 0) {
      showNotification("Price Droping!", `${trending}% since last 20 mins`)
    }
  })
}

const showNotification = (title, subtitle) => {
  notification = new Notification({ title: title, subtitle: subtitle })
  notification.show()
}

const handleWebSocketMsg = (message) => {
  const jsonMsg = JSON.parse(message)

  if (Array.isArray(jsonMsg[1])) {
    const ticker = tickerObject(jsonMsg[1])

    tray.setTitle(`${ticker.dailyChangePercentage}/${ticker.lastPrice}`)
  }
}

webSocket.on('message', handleWebSocketMsg)

app.on('ready', creatTray)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
