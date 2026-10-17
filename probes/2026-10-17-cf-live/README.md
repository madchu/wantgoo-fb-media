# 測試：Cloudflare Browser Run live 端點＋台北時區截圖（2026-10-17）

這是 Issue #19 的測試證據，不是正式流程。

## 為什麼要這輪
- **快速截圖 API（REST）：** 截得到玩股網真實圖表，但雲端瀏覽器用 UTC，圖上的 K 線日期少一天（10/16 的資料顯示成 2026-10-15）。API 也不接受時區參數（`emulateTimezone` 回 `Unrecognized key`）。
- **CDP（api.cloudflare.com 的 WebSocket）：** 環境代理拿掉了升級標頭，Cloudflare 回 400 `Expected websocket connection`。證據在分支 `probe/2026-10-17-cf-cdp3`。
- **這輪的做法：**
  1. 用 HTTP 建立工作階段；
  2. 從分頁清單取得 `wss://live.browser.run/...` 位址，這個位址以網址中的 JWT 驗證；
  3. 直接下 CDP 指令：`Emulation.setTimezoneOverride` 設成 `Asia/Taipei`，再截圖。

## 檔案
- **`tools/`：** 腳本。`run.sh` 負責建立與關閉工作階段，`cdpcap.mjs` 負責截圖。JWT 只留在 `/tmp`，不印出、不提交。
- **`local-test/`：** 在老闆 MBP 上用同一支 `cdpcap.mjs` 連本機 Chrome 的結果。Chrome 刻意用 `TZ=UTC` 啟動，以驗證腳本能把時區改回台北。
  - 時區：`tz_before` 是 UTC，`tz_after` 是 Asia/Taipei。
  - 資券圖標題顯示 2026-10-16；183.39%、6,455.94、47111.26 三個數字一致。
  - 載入與重新整理後的兩張圖 sha256 相同：`575869e8…`。
  - 台積電最後一根 K 棒是 2026-10-16。
- **`out/`：** 雲端 Routine 實測的結果，由 Routine 提交。
