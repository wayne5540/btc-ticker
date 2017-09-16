'use strict';

const {app, BrowserWindow, Menu, Tray} = require('electron')
require('isomorphic-fetch');

let tray = null



const fetchApi = () => {
  fetch("http://date.jsontest.com/").then((response) => {
    return response.json()
  }).then((json) => {
    tray.setTitle(json.time)
  }).catch((error) => {
    console.log("ERROR:", error)
  })
  setTimeout(fetchApi, 10)
}

const creatTray = () => {
  tray = new Tray('./green-earth.png')
  tray.setToolTip('This is my application.')

  setTimeout(fetchApi, 10)
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
