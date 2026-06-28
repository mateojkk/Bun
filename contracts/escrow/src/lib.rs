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

const ESCROW_KEY: Symbol = symbol_short!("escrow");

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
        assert!(!env.storage().persistent().has(&ESCROW_KEY));

        // Transfer the escrowed amount from subscriber to this contract
        subscriber.require_auth();
        let token_client = token::Client::new(&env, &token_contract);
        token_client.transfer(&subscriber, &env.current_contract_address(), &amount);

        let escrow = EscrowData {
            provider,
            subscriber,
            agent,
            token_contract,
            amount,
            usage: 0,
            unit_price,
            flat_rate,
            cycle_end,
            status: Status::Active,
            service_name,
        };

        env.storage().persistent().set(&ESCROW_KEY, &escrow);
    }

    pub fn record_usage(env: Env, additional: i128) {
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&ESCROW_KEY)
            .unwrap();
        assert_eq!(escrow.status, Status::Active);
        assert!(additional >= 0);

        escrow.usage += additional;
        env.storage().persistent().set(&ESCROW_KEY, &escrow);
    }

    pub fn settle(env: Env) {
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&ESCROW_KEY)
            .unwrap();
        assert_eq!(escrow.status, Status::Active);

        assert!(
            env.ledger().timestamp() >= escrow.cycle_end,
            "cycle not yet ended"
        );

        let used_amount = (escrow.usage * escrow.unit_price).min(escrow.amount);
        let refund_amount = escrow.amount - used_amount;

        // Transfer used amount to provider
        let token_client = token::Client::new(&env, &escrow.token_contract);
        if used_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.provider,
                &used_amount,
            );
        }
        // Return unused amount to subscriber
        if refund_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.subscriber,
                &refund_amount,
            );
        }

        escrow.status = Status::Settled;
        env.storage().persistent().set(&ESCROW_KEY, &escrow);
    }

    pub fn get_escrow(env: Env) -> EscrowData {
        env.storage().persistent().get(&ESCROW_KEY).unwrap()
    }
}

#[cfg(test)]
mod test;
