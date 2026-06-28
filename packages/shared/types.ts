export interface EscrowData {
  provider: string
  subscriber: string
  agent: string
  amount: string
  usage: string
  unit_price: string
  flat_rate: string
  cycle_end: string
  status: "Active" | "Settled" | "Refunded"
  service_name: string
}

export interface BunAccount {
  owner: string
  balance: string
  totalDeposited: string
}
