# 2026-10-26 fb_daily_growth 選題與來源（09:30）

## 預檢
- 週一，非 App 文日。Metricool `getScheduledPosts`（10/26，extendedRange）：只有 10/25 09:30 的 App 文（已發布）；10/26 09:30 前後 60 分鐘無貼文。
- `records/state.jsonl` 沒有 fb_daily_growth:2026-10-26。
- 過去 7 天本 lane 與相關貼文：10/22 00981A 持股（同事稿）、10/22 0056 除息昨收、10/23 00980A 持股增減（Run 02）、10/24 ETF 受益人數排行、10/25 App 還原權息。今天換角度：權重 vs 股數增減，該看哪一欄。

## Growth Run 02 檢查
- `run02-status`：exit 0，can_post true；已發 2 篇（00981A、00980A）；avoid 00980A；week_direct_used 0；missing_in_ledger 無。
- `last_trading_day`：2026-10-22（gate.mjs previousTradingDay）。
- 00981A：data_as_of 2026-10-22（等於 last_trading_day），有股數增減 1 列（kept 1／total 1），採用；依規則一檔成功就停，不再試下一檔。

## 候選角度
1. **（選定）00981A 10/22：日月光投控股數增加，帶出「權重會隨股價漂移，股數增減才是持股本身的變化」**
   - 吸睛點：圖上具體的股數增加與持有股數。
   - 獨有價值：玩股網成分股頁同時列持有股數、股數增減、權重與＋自選。
   - 行動目的：帶動網站使用（成分股頁＋自選）。
   - 可信度：截圖資料日 10/22＝最後交易日；只寫圖上數字，不寫排名、總數。
2. **（淘汰）其他主動式 ETF（00982A 等）**：規則為候選依序一檔成功即停，未擷取。
3. **（淘汰）一般選題（市場數據／外部新聞）**：Run 02 可發且本週 treatment 名額未用，依 daily.md 先跑 Run 02；外部數字閘門 fail closed，不另找外部新聞數字。
- 素材限制：只有 1 列有增減，素材偏薄，所以主洞察放在「看哪一欄」的判讀觀念，不只報數字。

## 讀過的來源
1. 玩股網「主動統一台股增長(00981A) - 成分股」https://www.wantgoo.com/stock/etf/00981a/constituent （WebFetch 2026-10-26 08:05 台北）：股票持股明細 2026/10/22，欄位持有股數、股數增減、權重、自選；資料來源說明「於每個交易日收盤後彙整更新」。

## 三種開頭
- 數字反差：「權重沒說的事，股數增減會說。」——抽象。
- 讀者問題：「主動式 ETF 的持股表，該看哪一欄？」——偏泛。
- 實用結論（選定變形）：直接用圖上最具體的變化開頭：日月光投控股數增加 547,000 股、持有來到 8,895,000 股。

## 編輯紅隊（第 1 輪）
1. 吸睛 1：開頭具體，但只有一檔變化，反差不強。
2. 獨特 2：用到玩股網成分股頁的股數增減欄與＋自選，承接頁就是截圖頁。
3. 易讀 2：一個重點（看股數增減，不只看權重），沒有清單。
4. 行動 2：CTA 指向截圖頁並說明＋自選，頁面已用 WebFetch 驗證。
5. 正確 2：claims-check unverified 0；不寫排名、總數、經理人意圖與因果。
總分 9，進入下一步。

## 編輯紀錄
- 類別：Growth Run 02
- ETF：00981A；資料日期 2026-10-22；截圖列數 kept 1／total 1
- 行動目的：帶動網站使用
- 開頭切角：實用結論（圖上最具體的變化）
- 截圖類型：wantgoo.etf.constituent，code=00981A
- CTA：搜尋詞「玩股網 00981A 成分股」；承接頁 https://www.wantgoo.com/stock/etf/00981a/constituent ；cta-plan：cta_mode=direct_utm，reason=TREATMENT
- 五項分數：吸睛 1／獨特 2／易讀 2／行動 2／正確 2（9）

## 預檢
- `claims-check`：ok，unverified 0。
- `cta-check`：ok。
- `check`：TRUSTED_CAPTURE_MISSING + LIVE_NOT_ENABLED（後者與 10/23 相同，屬 check 的結構性結果）。
