const { getTrending } = require('./bitfinexApi')
const { Notification } = require('electron')

getTrending().then((res) => console.log(res))


console.log(new Notification({ title: "jijo" }))