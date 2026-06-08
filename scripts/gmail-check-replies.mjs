#!/usr/bin/env node
/** Check Gmail inbox for bank inquiry replies via CDP */
import { chromium } from "playwright-core";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const QUERIES = [
  "from:lhbank.co.th OR to:callcenter@lhbank.co.th",
  "from:bangkokbank.com OR to:info@bangkokbank.com",
  "from:uob.co.th OR to:uobcallcentre@uob.co.th",
  "thailand bank DTV OR Destination Thailand Visa account",
];

async function searchGmail(page, q) {
  const url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(q)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(4000);

  const rows = await page.locator("tr.zA, div.Cp tbody tr").evaluateAll((els) =>
    els.slice(0, 15).map((el) => {
      const sender =
        el.querySelector(".yW span[email], .yW, .yX")?.textContent?.trim() ?? "";
      const subject =
        el.querySelector(".y6 span, .bog span")?.textContent?.trim() ?? "";
      const date = el.querySelector(".xW span, .xY span")?.textContent?.trim() ?? "";
      const snippet =
        el.querySelector(".y2, .Zt")?.textContent?.trim() ?? "";
      return { sender, subject, date, snippet };
    }),
  );
  return rows.filter((r) => r.subject || r.sender);
}

async function main() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto("https://mail.google.com/mail/u/0/#inbox", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(3000);
  console.log("Gmail URL:", page.url());

  if (page.url().includes("accounts.google.com")) {
    console.log(JSON.stringify({ error: "not_logged_in" }));
    await browser.close();
    process.exit(1);
  }

  const all = {};
  for (const q of QUERIES) {
    const rows = await searchGmail(page, q);
    all[q] = rows;
    console.log(`\n=== SEARCH: ${q} (${rows.length} rows) ===`);
    for (const r of rows) {
      console.log(`- [${r.date}] ${r.sender} | ${r.subject}`);
      if (r.snippet) console.log(`  ${r.snippet.slice(0, 120)}`);
    }
  }

  // Also check sent folder for our outbound
  const sentUrl =
    "https://mail.google.com/mail/u/0/#search/in%3Asent+%22DTV+visa+holder%22";
  await page.goto(sentUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  const sent = await page.locator("tr.zA").evaluateAll((els) =>
    els.slice(0, 10).map((el) => ({
      to: el.querySelector(".yW")?.textContent?.trim() ?? "",
      subject: el.querySelector(".y6 span")?.textContent?.trim() ?? "",
      date: el.querySelector(".xW span")?.textContent?.trim() ?? "",
    })),
  );
  console.log("\n=== SENT (DTV inquiry) ===");
  for (const s of sent) console.log(`- [${s.date}] To: ${s.to} | ${s.subject}`);

  await browser.close();
  console.log("\n---JSON---");
  console.log(JSON.stringify({ sent, searches: all }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
