#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Status {
    Active,
    Settled,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub provider: Address,
    pub subscriber: Address,
    pub agent: Address,
    pub token_contract: Address,
    pub amount: i128,
    pub usage: i128,
    pub unit_price: i128,
    pub flat_rate: i128,
    pub cycle_end: u64,
    pub status: Status,
    pub service_name: Symbol,
}

type EscrowKey = (Symbol, Address, Symbol);

fn escrow_key(subscriber: &Address, service_name: &Symbol) -> EscrowKey {
    (symbol_short!("escrow"), subscriber.clone(), service_name.clone())
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn init(
        env: Env,
        provider: Address,
        subscriber: Address,
        agent: Address,
        token_contract: Address,
        amount: i128,
        unit_price: i128,
        flat_rate: i128,
        cycle_end: u64,
        service_name: Symbol,
    ) {
        let key = escrow_key(&subscriber, &service_name);
        assert!(!env.storage().persistent().has(&key));

        subscriber.require_auth();
        let token_client = token::Client::new(&env, &token_contract);
        token_client.transfer(&subscriber, &env.current_contract_address(), &amount);

        let escrow = EscrowData {
            provider,
            subscriber: subscriber.clone(),
            agent,
            token_contract,
            amount,
            usage: 0,
            unit_price,
            flat_rate,
            cycle_end,
            status: Status::Active,
            service_name: service_name.clone(),
        };

        env.storage().persistent().set(&key, &escrow);
    }

    pub fn record_usage(env: Env, subscriber: Address, service_name: Symbol, additional: i128) {
        let key = escrow_key(&subscriber, &service_name);
        let mut escrow: EscrowData = env.storage().persistent().get(&key).unwrap();
        assert_eq!(escrow.status, Status::Active);
        assert!(additional >= 0);

        // Require the agent or provider to authorize the usage metering
        escrow.agent.require_auth();

        escrow.usage += additional;
        env.storage().persistent().set(&key, &escrow);
    }

    pub fn settle(env: Env, subscriber: Address, service_name: Symbol) {
        let key = escrow_key(&subscriber, &service_name);
        let mut escrow: EscrowData = env.storage().persistent().get(&key).unwrap();
        assert_eq!(escrow.status, Status::Active);

        // Require the Bun agent to trigger the settlement
        escrow.agent.require_auth();

        let used_amount = ((escrow.usage * escrow.unit_price) + escrow.flat_rate).min(escrow.amount);
        let is_exhausted = used_amount >= escrow.amount;

        assert!(
            env.ledger().timestamp() >= escrow.cycle_end || is_exhausted,
            "cycle not yet ended and funds not exhausted"
        );

        let refund_amount = escrow.amount - used_amount;

        let token_client = token::Client::new(&env, &escrow.token_contract);
        if used_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.provider,
                &used_amount,
            );
        }
        if refund_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.subscriber,
                &refund_amount,
            );
        }

        escrow.status = Status::Settled;
        env.storage().persistent().set(&key, &escrow);
    }

    pub fn get_escrow(env: Env, subscriber: Address, service_name: Symbol) -> EscrowData {
        let key = escrow_key(&subscriber, &service_name);
        env.storage().persistent().get(&key).unwrap()
    }
}

#[cfg(test)]
mod test;
