#!/usr/bin/env node
/**
 * Connect to Chrome CDP (debug mode) and send bank inquiry emails via Gmail UI.
 * Prereq: Chrome running with --remote-debugging-port=9222
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
const gmailPass = process.env.GMAIL_PASS;
const senderName = process.env.SENDER_NAME ?? "Li Jianya";
const dryRun = process.argv.includes("--dry-run");

const subject =
  "Inquiry: Can DTV visa holder open a personal savings account? (Chinese national)";

function buildBody(bankName) {
  return `Dear ${bankName} Customer Service,

I am a Chinese national holding a Destination Thailand Visa (DTV / 目的地泰国签证).

I would like to confirm the following before visiting a branch:

1. Can I open a personal THB savings account with my DTV visa?
2. If not accepted, are there any exceptions (e.g. rental contract, Thai phone number in my name, reference letter from school/gym/employer)?
3. Which visa types are currently accepted for foreign account opening?
4. Which branches in Bangkok are recommended for foreigners, and is Chinese-language support available?

My planned documents:
- Valid passport with DTV visa stamp
- Thai residential address proof (rental agreement)
- Thai mobile number registered in my name
- Chinese national ID (if required)

I prefer written confirmation by email so I can prepare the correct documents before visiting.

Thank you for your assistance.

Best regards,
${senderName}
${gmailUser}`;
}

function appendLog(line) {
  if (!existsSync(logPath)) return;
  const content = readFileSync(logPath, "utf8");
  writeFileSync(logPath, content.trimEnd() + `\n- [${new Date().toISOString()}] ${line}\n`);
}

async function ensureGmailLogin(page) {
  await page.goto("https://mail.google.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  const url = page.url();
  if (url.includes("mail.google.com/mail") && !url.includes("accounts.google.com")) {
    console.log("Already logged into Gmail.");
    return true;
  }

  if (!gmailPass) {
    throw new Error("Not logged in and GMAIL_PASS not set.");
  }

  // Google login flow
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count()) {
    await emailInput.first().fill(gmailUser);
    await page.locator("#identifierNext, button:has-text('Next')").first().click();
    await page.waitForTimeout(3000);
  }

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.first().waitFor({ state: "visible", timeout: 30000 });
  await passwordInput.first().fill(gmailPass);
  await page.locator("#passwordNext, button:has-text('Next')").first().click();
  await page.waitForTimeout(5000);

  const afterUrl = page.url();
  if (afterUrl.includes("challenge") || afterUrl.includes("signin/rejected")) {
    throw new Error(`Google login blocked or needs 2FA: ${afterUrl}`);
  }
  if (!afterUrl.includes("mail.google.com")) {
    await page.goto("https://mail.google.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
  }
  return page.url().includes("mail.google.com");
}

async function sendViaCompose(page, to, bankName) {
  const body = buildBody(bankName);
  const composeUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  await page.goto(composeUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(4000);

  const sendBtn = page.locator('div[role="button"][data-tooltip*="Send"], div[role="button"][aria-label*="Send"], div[role="button"]:has-text("Send")');
  if (!(await sendBtn.count())) {
    throw new Error("Send button not found in Gmail compose.");
  }
  if (dryRun) {
    console.log(`[DRY RUN] Compose ready for ${to}`);
    return;
  }
  await sendBtn.first().click();
  await page.waitForTimeout(3000);
}

async function main() {
  const banks = JSON.parse(readFileSync(banksPath, "utf8"));
  const onlyPending = process.argv.includes("--pending-only");
  const emailBanks = banks.filter(
    (b) => b.channel === "email" && b.email && (!onlyPending || b.status === "pending"),
  );

  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0] ?? (await browser.newContext());
  const page = context.pages()[0] ?? (await context.newPage());

  console.log(`Connected to CDP. Current page: ${page.url()}`);

  const loggedIn = await ensureGmailLogin(page);
  if (!loggedIn) throw new Error("Failed to reach Gmail inbox.");

  for (const bank of emailBanks) {
    try {
      await sendViaCompose(page, bank.email, bank.name);
      if (!dryRun) {
        bank.status = "sent";
        bank.sentAt = new Date().toISOString();
        appendLog(`✅ CDP/Gmail **${bank.nameZh}** → ${bank.email}`);
        console.log(`Sent to ${bank.name}`);
      }
    } catch (err) {
      bank.status = "failed";
      bank.error = err.message;
      appendLog(`❌ CDP/Gmail **${bank.nameZh}** → ${bank.email} | ${err.message}`);
      console.error(`Failed ${bank.name}:`, err.message);
    }
  }

  writeFileSync(banksPath, JSON.stringify(banks, null, 2) + "\n");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
