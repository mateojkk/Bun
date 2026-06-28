#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Bytes, BytesN, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct BalanceCommitment {
    pub subscriber: Address,
    pub committed_hash: BytesN<32>,
    pub committed_at: u64,
}

const BALANCE_KEY: Symbol = symbol_short!("bcomm");

#[contract]
pub struct ZkVerifierContract;

#[contractimpl]
impl ZkVerifierContract {
    pub fn commit_balance(
        env: Env,
        subscriber: Address,
        balance_hash: BytesN<32>,
    ) {
        // In production: subscriber.require_auth();
        env.storage().persistent().set(
            &BALANCE_KEY,
            &BalanceCommitment {
                subscriber,
                committed_hash: balance_hash,
                committed_at: env.ledger().timestamp(),
            },
        );
    }

    pub fn verify(
        env: Env,
        preimage: Bytes,
        required_minimum: i128,
    ) -> bool {
        let commitment: BalanceCommitment = env
            .storage()
            .persistent()
            .get(&BALANCE_KEY)
            .unwrap();

        let hash: BytesN<32> = env.crypto().sha256(&preimage).into();

        if hash != commitment.committed_hash {
            return false;
        }

        true
    }
}

#[cfg(test)]
mod test;
