# fb_external:2026-10-22:run02_00981a（補帳）

- 這篇不是本 repo 的 Routine 發的：Metricool 402739449，2026-10-22 12:00 排程，10:39 建立，由其他流程直接建立，屬 Growth Run 02 的 00981A 持股變化貼文。
- GPT QA on ops PR #68（P1-3）：Metricool 已有、帳本沒有，會讓 Run 02 篇數算成 0。2026-10-22 12:06 發布後用 `ledger-import` 補進帳本：
  - CTA：搜尋詞「玩股網 00981A 成分股」，沒有連結（`cta_mode: search`，`reason: EXTERNAL_POST`），計入 Run 02 篇數，不占 CTA 試驗每週帶網址名額。
  - 狀態：PUBLISHED，FB 1603623928474476。
  - `out/external.json` 只留貼文本身的欄位（同 save-create-response），不含帳號 e-mail 或使用者 ID。
- 截圖與文案不是本 pipeline 的閘門產出，這裡沒有 draft、manifest 或 evidence。
