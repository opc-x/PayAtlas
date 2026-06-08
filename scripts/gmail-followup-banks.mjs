#!/usr/bin/env node
/**
 * 1) Check sent + replies for bank DTV inquiries
 * 2) Send follow-up (加倍) if no reply yet
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const banksPath = join(root, "research/thailand-bank-dtv/banks.json");
const logPath = join(root, "research/thailand-bank-dtv/outreach-log.md");

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const gmailUser = process.env.GMAIL_USER ?? "lijianya866@gmail.com";
const senderName = process.env.SENDER_NAME ?? "Li Jianya";
const followUpOnly = !process.argv.includes("--check-only");

const ORIGINAL_SUBJECT =
  "Inquiry: Can DTV visa holder open a personal savings account? (Chinese national)";
const FOLLOWUP_SUBJECT = `Follow-up: ${ORIGINAL_SUBJECT}`;

function buildFollowUpBody(bankName) {
  return `Dear ${bankName} Customer Service,

I am following up on my email sent earlier today regarding opening a personal THB savings account with a Destination Thailand Visa (DTV).

Could you please confirm in writing:
1. Whether DTV holders are eligible to open an account at your bank
2. Required documents and acceptable visa types
3. Recommended Bangkok branch for foreigners (Chinese-language support if available)

I am ready to visit a branch once I receive your guidance.

Thank you.

Best regards,
${senderName}
${gmailUser}`;
}

function appendLog(line) {
  if (!existsSync(logPath)) return;
  writeFileSync(logPath, readFileSync(logPath, "utf8").trimEnd() + `\n- [${new Date().toISOString()}] ${line}\n`);
}

async function getThreadTexts(page) {
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const items = [];
    for (const row of document.querySelectorAll("tr.zA, div.Cp tr, div.bqe")) {
      const text = row.innerText?.replace(/\s+/g, " ").trim();
      if (text && text.length > 10) items.push(text.slice(0, 300));
    }
    return [...new Set(items)].slice(0, 30);
  });
}

async function openSearch(page, query) {
  await page.goto(
    `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`,
    { waitUntil: "domcontentloaded", timeout: 60000 },
  );
  return getThreadTexts(page);
}

async function sendFollowUp(page, to, bankName) {
  const body = buildFollowUpBody(bankName);
  const url = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(FOLLOWUP_SUBJECT)}&body=${encodeURIComponent(body)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500);
  const sendBtn = page.locator(
    'div[role="button"][data-tooltip*="Send"], div[role="button"][aria-label*="Send"]',
  );
  if (!(await sendBtn.count())) throw new Error("Send button not found");
  await sendBtn.first().click();
  await page.waitForTimeout(2500);
}

async function main() {
  const banks = JSON.parse(readFileSync(banksPath, "utf8"));
  const emailBanks = banks.filter((b) => b.channel === "email" && b.email);

  const browser = await chromium.connectOverCDP(CDP_URL);
  const page = browser.contexts()[0].pages()[0] ?? (await browser.contexts()[0].newPage());

  const report = { sent: [], replies: [], followUps: [] };

  // Check our outbound
  report.sent = await openSearch(
    page,
    `in:sent subject:"${ORIGINAL_SUBJECT}"`,
  );

  // Check replies from each bank domain
  for (const bank of emailBanks) {
    const domain = bank.email.split("@")[1];
    const replies = await openSearch(page, `from:${domain} newer_than:2d`);
    const hasReply = replies.some(
      (t) =>
        !t.includes("Mail Delivery") &&
        (t.toLowerCase().includes("re:") ||
          t.toLowerCase().includes("reply") ||
          t.toLowerCase().includes("thank") ||
          t.toLowerCase().includes("account") ||
          t.toLowerCase().includes("visa")),
    );
    report.replies.push({ bank: bank.id, domain, count: replies.length, samples: replies.slice(0, 3), hasReply });

    if (followUpOnly && !hasReply && replies.length === 0) {
      try {
        await sendFollowUp(page, bank.email, bank.name);
        bank.followUpAt = new Date().toISOString();
        bank.status = "follow-up-sent";
        appendLog(`🔁 Follow-up **${bank.nameZh}** → ${bank.email}`);
        report.followUps.push({ bank: bank.id, status: "sent" });
      } catch (e) {
        report.followUps.push({ bank: bank.id, status: "failed", error: e.message });
      }
    }
  }

  writeFileSync(banksPath, JSON.stringify(banks, null, 2) + "\n");
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
