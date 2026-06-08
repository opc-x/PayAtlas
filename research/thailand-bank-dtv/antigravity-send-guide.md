# 用 Antigravity 浏览器发送咨询邮件（手动步骤）

> Cloud Agent 环境无法调用 Antigravity 浏览器；请在你本机 Cursor 中新建独立浏览器窗口操作，与 jcui1 账号隔离。

## 1. 准备 Gmail

1. 打开 [Google 账号 → 安全性](https://myaccount.google.com/security)
2. 开启**两步验证**（若未开启）
3. 生成 **应用专用密码**（App Password）→ 选择「邮件 / 其他」
4. SMTP 脚本或第三方客户端用这个 16 位密码，**不要用登录密码**

## 2. Antigravity 浏览器操作

1. 在 Cursor 中让 Agent 打开 **Antigravity 浏览器新窗口**（独立于 jcui1）
2. 访问 https://mail.google.com
3. 登录 `lijianya866@gmail.com`
4. 点「撰写」

## 3. 逐封发送（有邮箱的 3 家）

每封邮件：

- **收件人**：见下表
- **主题**：`Inquiry: Can DTV visa holder open a personal savings account? (Chinese national)`
- **正文**：复制 `email-template.md`，把 `[Bank Name]` 换成银行英文名

| # | 银行 | 收件人 |
|---|------|--------|
| 1 | LH Bank | callcenter@lhbank.co.th |
| 2 | Bangkok Bank | info@bangkokbank.com |
| 3 | UOB Thailand | uobcallcentre@uob.co.th |

发完后在本仓库 `outreach-log.md` 把对应行状态改为 `sent` 并填日期。

## 4. 官网表单（无邮箱的 4 家）

用同一正文，在以下页面选「General Information / Products & Services」类主题提交：

| 银行 | 链接 |
|------|------|
| KBank | https://www.kasikornbank.com/en/contact/pages/contact.aspx |
| SCB | https://www.scb.co.th/en/personal-banking/contact-scb |
| Krungsri | https://www.krungsri.com/en/support/contact-us |
| ttb | https://www.ttbbank.com/en/contact |

## 5. 回复跟进

- 在 Gmail 给咨询邮件加标签：`thailand-bank-dtv`
- 收到回复后更新 `outreach-log.md` 对应银行小节
