#!/usr/bin/env node
/**
 * Send DTV bank account inquiry emails via Gmail SMTP.
 * Usage:
 *   GMAIL_USER=you@gmail.com GMAIL_APP_PASSWORD=xxxx node scripts/send-bank-inquiry-emails.mjs
 *   GMAIL_USER=you@gmail.com GMAIL_APP_PASSWORD=xxxx node scripts/send-bank-inquiry-emails.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const banksPath = join(root, "research/thailand-bank-dtv/banks.json");
const logPath = join(root, "research/thailand-bank-dtv/outreach-log.md");

const dryRun = process.argv.includes("--dry-run");
const senderName = process.env.SENDER_NAME ?? "Li Jianya";
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD ?? process.env.GMAIL_PASS;

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
${gmailUser ?? "lijianya866@gmail.com"}`;
}

function appendLog(line) {
  const stamp = new Date().toISOString();
  const entry = `- [${stamp}] ${line}\n`;
  if (existsSync(logPath)) {
    const content = readFileSync(logPath, "utf8");
    if (!content.includes("## Send Log")) {
      writeFileSync(logPath, content + "\n## Send Log\n\n" + entry);
    } else {
      writeFileSync(logPath, content.trimEnd() + "\n" + entry);
    }
  }
}

async function main() {
  const banks = JSON.parse(readFileSync(banksPath, "utf8"));
  const emailBanks = banks.filter((b) => b.channel === "email" && b.email);

  if (!gmailUser || !gmailPass) {
    console.error("Set GMAIL_USER and GMAIL_APP_PASSWORD (or GMAIL_PASS).");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

  if (!dryRun) {
    await transporter.verify();
    console.log("SMTP connection verified.");
  }

  const results = [];

  for (const bank of emailBanks) {
    const mail = {
      from: `"${senderName}" <${gmailUser}>`,
      to: bank.email,
      subject,
      text: buildBody(bank.name),
    };

    if (dryRun) {
      console.log(`[DRY RUN] Would send to ${bank.name} <${bank.email}>`);
      results.push({ bank: bank.id, status: "dry-run" });
      continue;
    }

    try {
      const info = await transporter.sendMail(mail);
      console.log(`Sent to ${bank.name}: ${info.messageId}`);
      bank.status = "sent";
      bank.sentAt = new Date().toISOString();
      bank.messageId = info.messageId;
      appendLog(`✅ **${bank.nameZh}** → ${bank.email} | messageId: ${info.messageId}`);
      results.push({ bank: bank.id, status: "sent", messageId: info.messageId });
    } catch (err) {
      console.error(`Failed ${bank.name}:`, err.message);
      bank.status = "failed";
      bank.error = err.message;
      appendLog(`❌ **${bank.nameZh}** → ${bank.email} | error: ${err.message}`);
      results.push({ bank: bank.id, status: "failed", error: err.message });
    }
  }

  writeFileSync(banksPath, JSON.stringify(banks, null, 2) + "\n");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
