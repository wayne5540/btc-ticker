'use strict';

// Library
const path = require('path')
const WebSocket = require('ws')
const { shell } = require('electron')
const helpers = require('./helpers/helper')
const { app, Tray, Notification, Menu, MenuItem } = require('electron')
const { tickerObject, getTrending } = require('./bitfinexApi')

// Constants
const RECONNECTING_TIME = 60 * 1000 // 1 min
const SILIENT_PERIOD = 5 * 60 * 1000 // 5 mins
const TRENDING_INTERVAL = 60 * 1000 // 1 min
const TRENDING_CHNAGE_TARGET = 0.001

// Global variables
let webSocket = null
let tray = null
let notification = null
let lastNotifiedAt = null
let checkTrendingInterval = null
const notifyMenuItem = new MenuItem({ label: 'Notify', type: 'checkbox' })
const reconnectMenuItem = new MenuItem({
  label: 'Reconnect', type: 'normal',
  click: (_menuItem, _browserWindow, _event) => { webSocket.close() }
})
const bitfinexMenuItem = new MenuItem({
  label: 'Bitfinex', type: 'normal',
  click: (_menuItem, _browserWindow, _event) => { shell.openExternal('https://www.bitfinex.com/trading/BTCUSD') }
})

const MenuItemSeparator = new MenuItem({
  type: 'separator'
})

const QuitMenuItem = new MenuItem({
  label: 'Quit', type: 'normal',
  click: (_menuItem, _browserWindow, _event) => { app.quit() }
})


const handleWebSocketMsg = (message) => {
  const jsonMsg = JSON.parse(message)

  if (Array.isArray(jsonMsg[1])) {
    const ticker = tickerObject(jsonMsg[1])

    tray.setTitle(`${helpers.round(ticker.dailyChangePercentage, 2)}%/${ticker.lastPrice}`)
  }
}

const connectWebSocket = () => {
  const ws = new WebSocket('wss://api.bitfinex.com/ws/2')

  const msg = {
    event: 'subscribe',
    channel: 'ticker',
    symbol: 'tBTCUSD'
  }

  ws.on('open', () => console.log("WebSocket Opened"))
  ws.on('open', () => ws.send(JSON.stringify(msg)))
  ws.on('message', handleWebSocketMsg)
  ws.on('error', (e) => console.log("Websocket Error:", e))
  ws.on('close', (e) => {
    console.log("Websocket Closed, reconnecting...: ", e)
    setTimeout(reconnectWebSocket, RECONNECTING_TIME);
  })

  return ws
}

const reconnectWebSocket = () => {
  if (webSocket != null && webSocket.readyState == WebSocket.OPEN) {
    webSocket.close()
  }

  webSocket = connectWebSocket()

  setTimeout(() => {
    if (webSocket.readyState !== WebSocket.OPEN) {
      reconnectWebSocket()
    }
  }, RECONNECTING_TIME);
}


const creatTray = () => {
  tray = new Tray(path.join(__dirname, 'bitcoin-logo-16.png'))
  tray.setToolTip('24hrs % changes / BTC price')

  setContextMenu()

  if (Notification.isSupported()) {
    checkTrendingInterval = setInterval(checkTrending, TRENDING_INTERVAL)
  }

  reconnectWebSocket()
}

const setContextMenu = () => {
  const contextMenu = new Menu
  contextMenu.append(notifyMenuItem)
  contextMenu.append(reconnectMenuItem)
  contextMenu.append(bitfinexMenuItem)
  contextMenu.append(MenuItemSeparator)
  contextMenu.append(QuitMenuItem)

  tray.setContextMenu(contextMenu)
}

const inSilentPeriod = () => (
  lastNotifiedAt != null && Date.now() - lastNotifiedAt < SILIENT_PERIOD
)

const checkTrending = () => {
  if (!notifyMenuItem.checked || inSilentPeriod() ) {
    return
  }

  getTrending().then((trending) => {
    if (trending > TRENDING_CHNAGE_TARGET) {
      showNotification("Price Rising!", `${trending}% since last 20 mins`)
      lastNotifiedAt = Date.now()
    }

    if (trending < -TRENDING_CHNAGE_TARGET) {
      showNotification("Price Droping!", `${trending}% since last 20 mins`)
      lastNotifiedAt = Date.now()
    }
  })
}

const showNotification = (title, subtitle) => {
  notification = new Notification({ title: title, subtitle: subtitle })
  notification.show()
}


app.on('ready', creatTray)
app.on('ready', () => {
  app.dock.hide()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
