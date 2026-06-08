# PayAtlas 支付图谱

> 全球支付渠道调研 · 方案选型 · 通道打通

PayAtlas 是一个面向 **全球支付渠道** 的调研与集成框架。帮你看清各地区、各赛道的支付方案差异，完成选型尽调，并沉淀可落地的接入路径。

## 核心理念

| 层级 | 说明 |
|------|------|
| **渠道图谱** | 按地区/币种/场景梳理 PSP、收单、钱包、BNPL 等能力 |
| **调研尽调** | 费率、结算周期、合规要求、拒付风险等结构化对比 |
| **接入方案** | 从调研结论到统一接入层的实现路径 |

```
业务需求 ──► 调研问卷/尽调 ──► 渠道匹配 ──► 方案对比 ──► 接入蓝图 ──► 统一集成层
                  ▲
            channels/ + data/  渠道知识库（核心资产）
```

## 项目结构

```
PayAtlas/
├── data/channels/        # 结构化渠道数据（地区、能力、费率维度）
├── channels/             # 渠道调研模板与尽调清单
│   ├── regions/          # 按地区（SEA、EU、LATAM…）
│   ├── providers/        # 按厂商/方案类型
│   └── surveys/          # 调研问卷与尽调模板
├── src/
│   ├── research/         # 调研匹配、对比、评分
│   ├── integration/      # 统一接入抽象
│   └── core/             # 类型与公共逻辑
└── docs/                 # 架构与设计文档
```

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

## 环境变量

见 [`.env.example`](./.env.example)。

## 路线图

- [x] 项目骨架 & 渠道知识库目录
- [ ] 渠道数据 Schema & 示例库
- [ ] 需求 → 渠道匹配引擎
- [ ] 尽调报告生成
- [ ] 统一 Payment Adapter 接口
- [ ] 主流 PSP 接入 PoC（Stripe / Adyen / PayPal…）

## License

MIT
