import { SEED_CHANNELS } from "./data/channels.js";
import { matchChannels } from "./research/matcher.js";
import { formatReport, generateDueDiligenceReport } from "./research/report.js";

async function main() {
  console.log("🌍 PayAtlas — 全球支付渠道调研 & 打通\n");

  const brief = {
    regions: ["SEA", "EU"] as const,
    currencies: ["USD", "EUR", "SGD", "IDR"],
    businessType: "ecommerce" as const,
    capabilities: ["card", "wallet", "local_method"] as const,
    monthlyVolumeUsd: "50k_500k" as const,
    requireLocalAcquiring: true,
    notes: "跨境电商，需东南亚本地支付方式",
  };

  const matches = matchChannels(
    {
      regions: [...brief.regions],
      currencies: [...brief.currencies],
      businessType: brief.businessType,
      capabilities: [...brief.capabilities],
      monthlyVolumeUsd: brief.monthlyVolumeUsd,
      requireLocalAcquiring: brief.requireLocalAcquiring,
      notes: brief.notes,
    },
    SEED_CHANNELS
  );

  const report = generateDueDiligenceReport(
    {
      regions: [...brief.regions],
      currencies: [...brief.currencies],
      businessType: brief.businessType,
      capabilities: [...brief.capabilities],
    },
    matches
  );

  console.log(formatReport(report));
}

main().catch(console.error);
