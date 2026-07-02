#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Bytes, Env};

fn build_preimage(env: &Env, balance_stroops: i64, salt_byte: u8) -> Bytes {
    let mut bytes = [0u8; PREIMAGE_LEN as usize];
    bytes[..8].copy_from_slice(&balance_stroops.to_be_bytes());
    bytes[8..].fill(salt_byte);
    Bytes::from_slice(env, &bytes)
}

#[test]
fn test_commit_and_verify_minimum() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZkVerifierContract, ());
    let client = ZkVerifierContractClient::new(&env, &contract_id);

    let subscriber = Address::generate(&env);
    let preimage = build_preimage(&env, 25_000_000, 7);
    let hash = env.crypto().sha256(&preimage).into();
    client.commit_balance(&subscriber, &hash);

    assert!(client.verify(&subscriber, &preimage, &20_000_000));
    assert!(!client.verify(&subscriber, &preimage, &30_000_000));
}

#[test]
fn test_wrong_preimage_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZkVerifierContract, ());
    let client = ZkVerifierContractClient::new(&env, &contract_id);

    let subscriber = Address::generate(&env);
    let preimage = build_preimage(&env, 25_000_000, 7);
    let hash = env.crypto().sha256(&preimage).into();
    client.commit_balance(&subscriber, &hash);

    let wrong = build_preimage(&env, 25_000_000, 9);
    assert!(!client.verify(&subscriber, &wrong, &1));
}

#[test]
fn test_per_subscriber_commitments() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZkVerifierContract, ());
    let client = ZkVerifierContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let alice_preimage = build_preimage(&env, 10_000_000, 1);
    let bob_preimage = build_preimage(&env, 50_000_000, 2);

    client.commit_balance(&alice, &env.crypto().sha256(&alice_preimage).into());
    client.commit_balance(&bob, &env.crypto().sha256(&bob_preimage).into());

    assert!(client.verify(&alice, &alice_preimage, &5_000_000));
    assert!(!client.verify(&alice, &bob_preimage, &1));
    assert!(client.verify(&bob, &bob_preimage, &40_000_000));
}
