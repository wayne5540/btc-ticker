const { getTrending } = require('./bitfinexApi')

getTrending().then((res) => console.log(res))