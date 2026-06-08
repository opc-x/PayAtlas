import type {
  ChannelMatch,
  PaymentCapability,
  PaymentChannel,
  ResearchBrief,
} from "../core/types.js";

function regionOverlap(
  brief: ResearchBrief,
  channel: PaymentChannel
): boolean {
  if (channel.regions.includes("GLOBAL")) return true;
  return brief.regions.some((r) => channel.regions.includes(r));
}

function capabilityCoverage(
  brief: ResearchBrief,
  channel: PaymentChannel
): { covered: PaymentCapability[]; missing: PaymentCapability[] } {
  const covered = brief.capabilities.filter((c) =>
    channel.capabilities.includes(c)
  );
  const missing = brief.capabilities.filter(
    (c) => !channel.capabilities.includes(c)
  );
  return { covered, missing };
}

/** 根据调研需求对渠道打分排序 */
export function matchChannels(
  brief: ResearchBrief,
  channels: PaymentChannel[]
): ChannelMatch[] {
  const results: ChannelMatch[] = [];

  for (const channel of channels) {
    const reasons: string[] = [];
    const gaps: string[] = [];
    let score = 0;

    if (!regionOverlap(brief, channel)) continue;
    score += 30;
    reasons.push(`覆盖目标地区: ${brief.regions.join(", ")}`);

    if (!channel.businessTypes.includes(brief.businessType)) {
      gaps.push(`未明确支持业务类型: ${brief.businessType}`);
      score -= 10;
    } else {
      score += 20;
      reasons.push(`支持业务类型: ${brief.businessType}`);
    }

    const { covered, missing } = capabilityCoverage(brief, channel);
    const capRatio =
      brief.capabilities.length > 0
        ? covered.length / brief.capabilities.length
        : 1;
    score += Math.round(capRatio * 40);
    if (covered.length > 0) {
      reasons.push(`能力匹配: ${covered.join(", ")}`);
    }
    if (missing.length > 0) {
      gaps.push(`缺失能力: ${missing.join(", ")}`);
    }

    const currencyHit = brief.currencies.filter((c) =>
      channel.currencies.includes(c)
    );
    if (currencyHit.length > 0) {
      score += 10;
      reasons.push(`支持币种: ${currencyHit.join(", ")}`);
    } else if (brief.currencies.length > 0) {
      gaps.push(`币种覆盖不足: 需要 ${brief.currencies.join(", ")}`);
    }

    results.push({ channel, score: Math.max(0, score), reasons, gaps });
  }

  return results.sort((a, b) => b.score - a.score);
}
