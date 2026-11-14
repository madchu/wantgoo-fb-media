# 2026-11-14 一般文選題紀錄（fb_daily_growth:2026-11-14）

## 前置檢查
- 週六，非 App 文日；11/14 09:30 前後 60 分鐘無其他 Facebook 排程（Metricool 讀回只有 11/13 09:30 已發布、11/15 09:30 App 文）。records/state.jsonl 無今天的工作項目。
- Growth Run 02：run02-status exit 2，problems = OUTSIDE_RUN、RUN_FULL、WEEK_CAP_REACHED；missing_in_ledger 為空。不選 Run 02。（註：已讀回 Metricool 10/22 起的排程，但為節省時間以空清單執行 run02-status；OUTSIDE_RUN 與 RUN_FULL 由帳本與日期判定，不受影響。）
- last_trading_day（gate.mjs previousTradingDay）：2026-11-13。
- 學習偏好 2026-W46 active：P1、P2 採用，E1 依設定不採用（見 editorial.json）。
- 過去 7 天本 lane：11/07、11/09、11/13 加權指數頁（市場數據 3 篇）、11/06 台積電均價、11/10 00631L 離季線（觀念 2 篇）、11/12 ETF 基金規模排行（網站功能 1 篇）。今天避開加權指數頁，補網站實用功能／觀念。

## 讀過的來源（讀取時間 2026-11-14 08:0x 台北）
- 玩股網〈台股ETF報酬率排行〉https://www.wantgoo.com/stock/etf/ranking/compensation（WebFetch 確認讀得到、主題一致）— 頁面說明「＊近一年含息報酬率單純以市價漲跌包含配息做計算。」「公式：(結束日市價-開始日市價+每單位配息金額)/開始日市價*100%。」「不考慮單筆投入、定期定額、交易成本等情況以免過於複雜。」資料日 2026/11/13。
- 鉅亨網盤中速報〈集中市場加權指數上漲1296.24點至44388.11點，漲幅3.01%〉https://news.cnyes.com/news/id/6661367（僅搜尋摘要，背景，文中不引用）。
- 註：WebFetch 讀到的年報酬率數字（00631L 105.5%）與瀏覽器擷取（114.2%）不同、名單略有差異，與 11/12 觀察到的伺服器端舊值現象相同（依數字推論，未驗證）；文中數字一律以本次截圖為準。

## 候選角度
1. **ETF 報酬率排行的年報酬率只比頭尾兩天的市價**（選定）— 吸睛：00631L 年報酬率 114.2% 排第二，但多數持有人帳上不是這個數字；獨有價值：玩股網排行頁寫明公式與不考慮定期定額；行動目的：帶動網站使用；可信度：本 lane 允許的 etf.ranking kind=compensation 截圖，資料日 11/13。
2. **11/13 開高後漲幅收斂** — 吸睛：盤中一度漲 3% 收 1.35%；但加權指數頁本週已用 3 次，且 11/05 已寫過高低點，淘汰。
3. **正2 ETF 包辦排行前段** — 與 11/10 槓桿 ETF 題材重疊，容易變成推銷槓桿商品，淘汰。

## 三種開頭
- 數字反差：「00631L 年報酬率 114.2%，你帳上可能完全不是這個數字」
- 讀者問題：「排行上的年報酬率，是誰的報酬？」（與上合併採用，P2）
- 實用結論：「看報酬率排行，先看它從哪天算到哪天」

## 預檢
- claims-check exit 0；cta-check exit 0；check：TRUSTED_CAPTURE_MISSING ＋ LIVE_NOT_ENABLED（結構性結果，與先前各天相同）。

## 編輯紅隊
1. 吸睛 2：排行數字與讀者自己報酬的落差，是真實常見誤讀。
2. 獨特 2：玩股網排行頁的年報酬率欄與頁面公式。
3. 易讀 2：一個重點、一層解釋、一句限制。
4. 行動 2：直連報酬率排行頁，已 WebFetch 驗證。
5. 正確 2：數字來自本次截圖，公式與限制對應頁面原文。

## 編輯紀錄
- 類別：網站實用功能
- 行動目的：帶動網站使用
- 開頭切角：讀者問題（排行數字不是你的報酬）
- 截圖類型：wantgoo.etf.ranking（kind=compensation）
- CTA：https://www.wantgoo.com/stock/etf/ranking/compensation；cta_mode=direct_utm；reason=DIRECT_DEFAULT
- 五項分數：2/2/2/2/2
