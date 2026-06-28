#![cfg(test)]
use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    token::StellarAssetClient,
    Env,
};

#[test]
fn test_init_and_get() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let provider = Address::generate(&env);
    let subscriber = Address::generate(&env);
    let agent = Address::generate(&env);
    let now = env.ledger().timestamp();

    // Create a mock SAC (Stellar Asset Contract) token for testing
    let token_contract = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
    // Mint tokens to subscriber
    token_client.mint(&subscriber, &100_0000000);

    client.init(
        &provider,
        &subscriber,
        &agent,
        &token_address,
        &100_0000000,
        &25000,
        &800_0000,
        &(now + 604800),
        &symbol_short!("netflix"),
    );

    let escrow = client.get_escrow();
    assert_eq!(escrow.amount, 100_0000000);
    assert_eq!(escrow.status, Status::Active);
    assert_eq!(escrow.token_contract, token_address);
}

#[test]
fn test_settle_after_cycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let provider = Address::generate(&env);
    let subscriber = Address::generate(&env);
    let agent = Address::generate(&env);
    let now = env.ledger().timestamp();

    // Create a mock SAC token for testing
    let token_contract = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
    // Mint tokens to subscriber
    token_client.mint(&subscriber, &100_0000000);

    client.init(
        &provider,
        &subscriber,
        &agent,
        &token_address,
        &100_0000000,
        &25000,
        &800_0000,
        &(now + 10),
        &symbol_short!("spotify"),
    );

    client.record_usage(&40);
    env.ledger().set_timestamp(now + 20);

    client.settle();

    let escrow = client.get_escrow();
    assert_eq!(escrow.status, Status::Settled);
}

#[test]
fn test_settle_transfers_correct_amounts() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let provider = Address::generate(&env);
    let subscriber = Address::generate(&env);
    let agent = Address::generate(&env);
    let now = env.ledger().timestamp();

    // Create a mock SAC token for testing
    let token_contract_reg = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract_reg.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
    let tok = token::Client::new(&env, &token_address);

    // Mint 100 tokens to subscriber (in stroops-equivalent units)
    let initial_amount: i128 = 100_0000000;
    token_client.mint(&subscriber, &initial_amount);

    // usage=10, unit_price=1_0000000 => used_amount = 10_0000000
    // refund_amount = 100_0000000 - 10_0000000 = 90_0000000
    let unit_price: i128 = 1_0000000;
    let usage: i128 = 10;

    client.init(
        &provider,
        &subscriber,
        &agent,
        &token_address,
        &initial_amount,
        &unit_price,
        &800_0000,
        &(now + 10),
        &symbol_short!("test"),
    );

    // After init, subscriber balance should be 0 (all transferred to contract)
    assert_eq!(tok.balance(&subscriber), 0);

    client.record_usage(&usage);
    env.ledger().set_timestamp(now + 20);

    client.settle();

    let used_amount = (usage * unit_price).min(initial_amount);
    let refund_amount = initial_amount - used_amount;

    // Provider should receive used_amount
    assert_eq!(tok.balance(&provider), used_amount);
    // Subscriber should receive refund_amount
    assert_eq!(tok.balance(&subscriber), refund_amount);
}
