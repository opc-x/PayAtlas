import type { ChannelMatch, DueDiligenceReport, ResearchBrief } from "../core/types.js";

export function generateDueDiligenceReport(
  brief: ResearchBrief,
  matches: ChannelMatch[]
): DueDiligenceReport {
  const top = matches.slice(0, 3);

  let recommendation: string;
  if (top.length === 0) {
    recommendation =
      "当前渠道库无完全匹配项，建议扩大地区覆盖或拆分多 PSP 组合方案。";
  } else {
    const names = top.map((m) => m.channel.name).join("、");
    recommendation = `建议优先尽调: ${names}。Top 1 为 ${top[0].channel.name}（得分 ${top[0].score}），可作为主通道 PoC。`;
  }

  return {
    brief,
    matches: top,
    recommendation,
    generatedAt: new Date().toISOString(),
  };
}

export function formatReport(report: DueDiligenceReport): string {
  const lines: string[] = [
    "# PayAtlas 尽调报告",
    "",
    `生成时间: ${report.generatedAt}`,
    "",
    "## 调研需求",
    `- 地区: ${report.brief.regions.join(", ")}`,
    `- 币种: ${report.brief.currencies.join(", ")}`,
    `- 业务: ${report.brief.businessType}`,
    `- 能力: ${report.brief.capabilities.join(", ")}`,
    "",
    "## 推荐结论",
    report.recommendation,
    "",
    "## 渠道匹配 Top 3",
  ];

  for (const [i, m] of report.matches.entries()) {
    lines.push(
      "",
      `### ${i + 1}. ${m.channel.name}（${m.channel.id}）— 得分 ${m.score}`,
      `- 类型: ${m.channel.type}`,
      `- 费率: ${m.channel.feeRange ?? "待调研"}`,
      `- 结算: ${m.channel.settlementDays != null ? `${m.channel.settlementDays} 天` : "待调研"}`,
      `- 匹配理由: ${m.reasons.join("；")}`,
      m.gaps.length > 0 ? `- 缺口: ${m.gaps.join("；")}` : ""
    );
  }

  return lines.filter(Boolean).join("\n");
}
