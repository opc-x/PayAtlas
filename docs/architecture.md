# PayAtlas 架构

## 设计哲学：Research → Route → Integrate

PayAtlas 把支付接入拆成三步，避免「上来就接 API、后面发现地区/合规不对」：

```
调研尽调 ──► 渠道图谱匹配 ──► 统一 Adapter 接入
```

## 模块职责

| 模块 | 路径 | 职责 |
|------|------|------|
| 渠道库 | `data/` + `src/data/` | 结构化 PSP 档案 |
| 调研模板 | `channels/surveys/` | 尽调清单、地区要点 |
| 匹配引擎 | `src/research/matcher.ts` | 需求 → 渠道打分 |
| 报告生成 | `src/research/report.ts` | 尽调报告输出 |
| 接入层 | `src/integration/adapter.ts` | 多 PSP 统一接口 |

## 数据流

1. 填写 `ResearchBrief`（地区、币种、能力、业务类型）
2. `matchChannels()` 从渠道库筛选排序
3. `generateDueDiligenceReport()` 输出推荐与缺口
4. 选定 PSP 后，实现 `PaymentAdapter` 注册到 `AdapterRegistry`

## 后续扩展

- `data/channels/*.json` 外置渠道库，支持社区贡献
- CLI：`payatlas research --region SEA --cap wallet`
- 与 ZuiTi 联动：客服场景中的退款/支付问题话术
