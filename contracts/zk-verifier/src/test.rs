#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Bytes, Env, IntoVal};

#[test]
fn test_commit_and_verify() {
    let env = Env::default();
    let contract_id = env.register(ZkVerifierContract, ());
    let client = ZkVerifierContractClient::new(&env, &contract_id);

    let subscriber = Address::generate(&env);

    let preimage = Bytes::from_slice(&env, &[1, 2, 3, 4, 5, 6, 7, 8]);
    let hash = env.crypto().sha256(&preimage).into();
    client.commit_balance(&subscriber, &hash);

    assert!(client.verify(&preimage, &10));
}

#[test]
fn test_wrong_preimage_fails() {
    let env = Env::default();
    let contract_id = env.register(ZkVerifierContract, ());
    let client = ZkVerifierContractClient::new(&env, &contract_id);

    let subscriber = Address::generate(&env);

    let preimage = Bytes::from_slice(&env, &[1, 2, 3, 4, 5, 6, 7, 8]);
    let hash = env.crypto().sha256(&preimage).into();
    client.commit_balance(&subscriber, &hash);

    let wrong = Bytes::from_slice(&env, &[9, 9, 9, 9]);
    assert!(!client.verify(&wrong, &10));
}
