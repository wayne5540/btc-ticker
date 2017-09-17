'use strict';

const {app, BrowserWindow, Menu, Tray} = require('electron')
const WebSocket = require('ws')
const webSocket = new WebSocket('wss://api.bitfinex.com/ws/2')
const path = require('path')
let tray = null


const creatTray = () => {
  tray = new Tray(path.join(__dirname, 'bitcoin-logo-16.png'))
  tray.setToolTip('24hrs % changes / BTC price')

  let msg = ({
    event: 'subscribe',
    channel: 'ticker',
    symbol: 'tBTCUSD'
  })

  webSocket.on('open', () => webSocket.send(JSON.stringify(msg)))
}


// https://bitfinex.readme.io/v2/reference#rest-public-ticker
// https://bitfinex.readme.io/v2/reference#ws-public-ticker
const findValue = (values, type) => {
  const mapping = [
    "BID",
    "BID_SIZE",
    "ASK",
    "ASK_SIZE",
    "DAILY_CHANGE",
    "DAILY_CHANGE_PERC",
    "LAST_PRICE",
    "VOLUME",
    "HIGH",
    "LOW"
  ]
  const index = mapping.indexOf(type)

  if (index >= 0) {
    return values[index]
  } else {
    console.log(`Error: Can't map ${type} in message`)
  }
}

const handleWebSocketMsg = (message) => {
  const jsonMsg = JSON.parse(message)

  if (Array.isArray(jsonMsg[1])) {
    const lastPrice = findValue(jsonMsg[1], "LAST_PRICE")
    const dailyChangePercentage = findValue(jsonMsg[1], "DAILY_CHANGE_PERC")
    tray.setTitle(`${dailyChangePercentage}/${lastPrice}`)
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

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (tray === null) {
    creatTray()
  }
})
