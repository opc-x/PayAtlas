# 用 Chrome Debug 模式发送咨询邮件

> 可用 **Chrome `--remote-debugging-port=9222`** + 独立 `user-data-dir`，与 jcui1 等其它账号隔离。
> Cloud Agent 已验证：CDP 可连、Gmail 可打开，但 **Google 两步验证必须人工在手机上确认**。

## 1. 准备 Gmail

1. 打开 [Google 账号 → 安全性](https://myaccount.google.com/security)
2. 开启**两步验证**（若未开启）
3. 生成 **应用专用密码**（App Password）→ 选择「邮件 / 其他」
4. SMTP 脚本或第三方客户端用这个 16 位密码，**不要用登录密码**

## 2. Chrome Debug 模式（推荐）

```bash
# 独立 profile，不污染其它 Google 账号
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=~/.chrome-profiles/thailand-bank-inquiry \
  --no-first-run
```

验证 CDP 是否就绪：

```bash
curl http://127.0.0.1:9222/json/version
```

## 3. 登录 Gmail（需手机确认一次）

1. 脚本或手动打开 https://mail.google.com
2. 输入账号密码后，Google 会弹出 **2-Step Verification**
3. 在 iPhone / iPad 的 Gmail 里点 **Yes**，并选择屏幕上的数字（如 **95**）
4. 登录成功后，该 profile 会记住 session，后续可自动发信

## 4. 自动发信（登录完成后）

```bash
export GMAIL_USER=lijianya866@gmail.com
export SENDER_NAME="你的护照拼音名"
node scripts/gmail-send-via-cdp.mjs
```

## 5. 纯手动撰写（备选）

1. 在 Debug Chrome 窗口访问 https://mail.google.com
2. 点「撰写」

## 6. 逐封发送（有邮箱的 3 家）

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

## 7. 官网表单（无邮箱的 4 家）

用同一正文，在以下页面选「General Information / Products & Services」类主题提交：

| 银行 | 链接 |
|------|------|
| KBank | https://www.kasikornbank.com/en/contact/pages/contact.aspx |
| SCB | https://www.scb.co.th/en/personal-banking/contact-scb |
| Krungsri | https://www.krungsri.com/en/support/contact-us |
| ttb | https://www.ttbbank.com/en/contact |

## 8. 回复跟进

- 在 Gmail 给咨询邮件加标签：`thailand-bank-dtv`
- 收到回复后更新 `outreach-log.md` 对应银行小节
