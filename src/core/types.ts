/** 地区代码 */
export type Region =
  | "US"
  | "EU"
  | "UK"
  | "SEA"
  | "CN"
  | "LATAM"
  | "MENA"
  | "GLOBAL";

/** 支付能力类型 */
export type PaymentCapability =
  | "card"
  | "wallet"
  | "bank_transfer"
  | "bnpl"
  | "crypto"
  | "cash"
  | "local_method";

/** 业务类型 */
export type BusinessType =
  | "ecommerce"
  | "saas"
  | "marketplace"
  | "gaming"
  | "subscription";

/** 渠道调研需求 */
export interface ResearchBrief {
  regions: Region[];
  currencies: string[];
  businessType: BusinessType;
  capabilities: PaymentCapability[];
  /** 月交易额区间（USD） */
  monthlyVolumeUsd?: "lt_50k" | "50k_500k" | "500k_5m" | "gt_5m";
  /** 是否需要本地收单 */
  requireLocalAcquiring?: boolean;
  notes?: string;
}

/** 支付渠道档案 */
export interface PaymentChannel {
  id: string;
  name: string;
  type: "psp" | "aggregator" | "wallet" | "bank" | "bnpl";
  regions: Region[];
  currencies: string[];
  capabilities: PaymentCapability[];
  /** 支持的业务类型 */
  businessTypes: BusinessType[];
  /** 结算周期（天） */
  settlementDays?: number;
  /** 费率区间描述 */
  feeRange?: string;
  /** 合规/牌照备注 */
  complianceNotes?: string;
  /** 官网 */
  website?: string;
}

/** 匹配结果 */
export interface ChannelMatch {
  channel: PaymentChannel;
  score: number;
  reasons: string[];
  gaps: string[];
}

/** 尽调报告摘要 */
export interface DueDiligenceReport {
  brief: ResearchBrief;
  matches: ChannelMatch[];
  recommendation: string;
  generatedAt: string;
}
