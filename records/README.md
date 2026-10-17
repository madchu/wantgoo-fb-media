# 發布狀態紀錄（`state.jsonl`）

每篇 FB 一般文以 `work_item_id` 記錄發布事件（`ATTEMPT_STARTED`、`READBACK_FOUND`、`READBACK_ABSENT`），格式見 `wantgoo-ai-ops/fb-pipeline/src/state.mjs`。閘門讀這個檔案判斷重複：已排程、已發布或等待讀回的工作項目一律擋下。

- 首篇 `fb_daily_growth:2026-10-17`（FB 1598488755654660）的事件抄自 `wantgoo-ai-ops` 分支 `claude/fb-first-post` 的 `posts/state.jsonl`。
- 這個分支 `dryrun/2026-10-17` 只放 TEST_ONLY 乾跑紀錄，不是正式狀態；正式狀態放哪裡，等每日排程核准時再定。
