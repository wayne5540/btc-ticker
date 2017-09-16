'use strict';

const {app, BrowserWindow, Menu, Tray} = require('electron')
require('isomorphic-fetch')
const ws = require('ws')

const w = new ws('wss://api.bitfinex.com/ws/2')

let tray = null



w.on('message', (msg) => console.log(msg))

let msg = ({ 
  event: 'subscribe',
  channel: 'ticker',
  symbol: 'tBTCUSD'
})



w.on('open', () => w.send(JSON.stringify(msg)))


const fetchApi = () => {
  // fetch("http://coincap.io/page/BTC").then((response) => {
  //   return response.json()
  // }).then((json) => {
  //   // console.log(json.price_usd)
  //   tray.setTitle(json.price_usd.toString())
  // }).catch((error) => {
  //   console.log("ERROR:", error)
  // })
  // setTimeout(fetchApi, 100)

  // request.get("http://coincap.io/page/BTC",
  //   (error, response, body) => {
  //     console.log(JSON.parse(body))
  //     tray.setTitle(json.price_usd.toString())
  // })

  // request.get( 
  //   `${url}/ticker/tBTCUSD`,
  //   (error, response, body) => console.log(body)
  // )
}

const creatTray = () => {
  tray = new Tray('./green-earth.png')
  tray.setToolTip('This is my application.')

  fetchApi()
}



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
