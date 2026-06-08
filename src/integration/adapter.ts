/**
 * 统一支付接入抽象层（蓝图）。
 * 后续各 PSP 实现此接口，实现「调研结论 → 可落地代码」的闭环。
 */

export interface PaymentIntent {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: "pending" | "succeeded" | "failed" | "requires_action";
  raw?: unknown;
}

export interface PaymentAdapter {
  readonly providerId: string;
  createPayment(intent: PaymentIntent): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number): Promise<PaymentResult>;
  getSettlementInfo(): Promise<{ cycleDays: number; currencies: string[] }>;
}

/** 适配器注册表（多 PSP 路由入口） */
export class AdapterRegistry {
  private adapters = new Map<string, PaymentAdapter>();

  register(adapter: PaymentAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  get(providerId: string): PaymentAdapter | undefined {
    return this.adapters.get(providerId);
  }

  list(): string[] {
    return [...this.adapters.keys()];
  }
}
