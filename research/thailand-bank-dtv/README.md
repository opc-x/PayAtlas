# 泰国银行 DTV 开户咨询跟踪

> 目标：以 DTV（目的地泰国签证）身份，向泰国主要银行书面咨询个人储蓄账户开户可行性，并记录回复供后续跟进。

## 发件邮箱

`lijianya866@gmail.com`

## 咨询策略

| 方式 | 适用银行 | 说明 |
|------|----------|------|
| **邮件（推荐）** | LH Bank、Bangkok Bank、UOB | 有公开邮箱，可异步留痕 |
| **官网表单** | KBank、SCB、Krungsri、ttb | 需浏览器手动提交（含 reCAPTCHA） |
| **电话** | 全部 | 泰国境内拨打，无书面记录 |

## 文件说明

| 文件 | 用途 |
|------|------|
| `banks.json` | 银行清单、联系方式、发送状态 |
| `email-template.md` | 统一咨询邮件模板 |
| `outreach-log.md` | 发送记录与银行回复跟踪 |
| `../../scripts/send-bank-inquiry-emails.mjs` | 批量发送脚本（Gmail SMTP，需 App Password） |
| `../../scripts/gmail-send-via-cdp.mjs` | 通过 Chrome CDP 在 Gmail UI 发信（推荐） |

## 发送邮件

```bash
# 建议使用 Gmail 应用专用密码（非登录密码）
export GMAIL_USER=lijianya866@gmail.com
export GMAIL_APP_PASSWORD=your-app-password
export SENDER_NAME="Your Passport Name"

# 预览
node scripts/send-bank-inquiry-emails.mjs --dry-run

# 实际发送
node scripts/send-bank-inquiry-emails.mjs
```

## 官网表单（需手动 / 浏览器自动化）

无公开邮箱的银行，用 `email-template.md` 正文复制到官网留言框：

- [KBank 联系表单](https://www.kasikornbank.com/en/contact/pages/contact.aspx)
- [SCB 留言](https://www.scb.co.th/en/personal-banking/contact-scb)
- [Krungsri 表单](https://www.krungsri.com/en/support/contact-us)
- [ttb 联系](https://www.ttbbank.com/en/contact)

## 回复跟进

收到回复后，在 `outreach-log.md` 对应银行下记录：

- 回复日期
- 结论（可开 / 不可开 / 需补充材料）
- 推荐分行
- 原文摘要或截图链接

## 已知政策（发送前调研，非银行正式回复）

- **LH Bank**：官网 FAQ 明确拒绝 DTV
- **Bangkok Bank**：2025 年起对 DTV/旅游签大幅收紧
- **Krungsri**：2024 年起明确拒绝 DTV
- 个别分行可能有例外，以银行书面/邮件回复为准
