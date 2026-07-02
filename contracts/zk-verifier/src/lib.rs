#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Bytes, BytesN, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct BalanceCommitment {
    pub subscriber: Address,
    pub committed_hash: BytesN<32>,
    pub committed_at: u64,
}

type CommitmentKey = (Symbol, Address);

const BALANCE_KEY: Symbol = symbol_short!("bcomm");
const BALANCE_LEN: u32 = 8;
const SALT_LEN: u32 = 32;
const PREIMAGE_LEN: u32 = BALANCE_LEN + SALT_LEN;

fn commitment_key(subscriber: &Address) -> CommitmentKey {
    (BALANCE_KEY, subscriber.clone())
}

#[contract]
pub struct ZkVerifierContract;

#[contractimpl]
impl ZkVerifierContract {
    /// Commit sha256(stroops_be_8_bytes || salt_32_bytes) keyed per subscriber.
    pub fn commit_balance(
        env: Env,
        subscriber: Address,
        balance_hash: BytesN<32>,
    ) {
        subscriber.require_auth();
        env.storage().persistent().set(
            &commitment_key(&subscriber),
            &BalanceCommitment {
                subscriber: subscriber.clone(),
                committed_hash: balance_hash,
                committed_at: env.ledger().timestamp(),
            },
        );
    }

    /// Verify preimage for subscriber and committed balance >= required_minimum (stroops).
    pub fn verify(
        env: Env,
        subscriber: Address,
        preimage: Bytes,
        required_minimum: i128,
    ) -> bool {
        let commitment: BalanceCommitment = env
            .storage()
            .persistent()
            .get(&commitment_key(&subscriber))
            .unwrap();

        if commitment.subscriber != subscriber {
            return false;
        }

        if preimage.len() != PREIMAGE_LEN {
            return false;
        }

        let hash: BytesN<32> = env.crypto().sha256(&preimage).into();
        if hash != commitment.committed_hash {
            return false;
        }

        let mut balance_bytes = [0u8; 8];
        for i in 0..8u32 {
            balance_bytes[i as usize] = preimage.get(i).unwrap();
        }
        let balance = i64::from_be_bytes(balance_bytes) as i128;
        balance >= required_minimum
    }
}

#[cfg(test)]
mod test;
