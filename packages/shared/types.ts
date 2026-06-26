export type UnitType = "Hour" | "API_Call" | "Seat" | "GB"

export type BillingCycle = "Daily" | "Weekly" | "Monthly"

export type SubscriptionStatus = "Active" | "Paused" | "Cancelled"

export type ProposalStatus = "Pending" | "Approved" | "Rejected"

export interface ServiceTemplate {
  provider: string
  agent: string
  serviceName: string
  unitType: UnitType
  unitPrice: string
  minCommitment: string | null
  billingCycle: BillingCycle
}

export interface Subscription {
  provider: string
  subscriber: string
  agent: string
  serviceName: string
  unitType: UnitType
  unitPrice: string
  maxSpend: string
  autoApprove: boolean
  usage: string
  status: SubscriptionStatus
  cycleStart: string
  cycleEnd: string
  lastSettled: string
}

export interface SettlementProposal {
  provider: string
  subscriber: string
  agent: string
  serviceName: string
  calculatedAmount: string
  usage: string
  periodStart: string
  periodEnd: string
  status: ProposalStatus
}

export interface SettledPayment {
  provider: string
  subscriber: string
  agent: string
  serviceName: string
  amount: string
  usage: string
  settledAt: string
}
