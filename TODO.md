## DOING

- [ ] Able to customise some variables
  - SILIENT_PERIOD
  - TRENDING_CHNAGE_TARGET


## TODOs

- [ ] WebSocket 斷線處理太麻煩了，看要不要改回 polling
- [ ] Selectable notify strategy
- [ ] High resolution icon
- [ ] Setup app icon
- [ ] Cammand + Tab 時不要顯示 App since it's only a Tray app (like Dropbox, Spotifree, Alfred... etc)
- [ ] Ticker 資訊佔太多空間，做成 image 當 Tray icon可以節省空間
  - https://github.com/Automattic/node-canvas
- [ ] Add auto start when login featrue

## DONE

- [x] Send notification when matching certain condition
  - notify user if absolute(last 10 minutes percentageChange) > 10%
  - percentageChange: (highest price - current price) / current price
- [x] 沒網路時 initialize 會狂噴 errors
- [x] Change daily percentage format: -12%, 2.33%
- [x] One click to open exchange website


## TO FIX

- [ ] 斷線／睡眠後 WebSocket 就斷了
