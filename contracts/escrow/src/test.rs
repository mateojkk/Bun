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
    let service = symbol_short!("netflix");

    let token_contract = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
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
        &service,
    );

    let escrow = client.get_escrow(&subscriber, &service);
    assert_eq!(escrow.amount, 100_0000000);
    assert_eq!(escrow.status, Status::Active);
}

#[test]
fn test_multiple_escrows_per_subscriber() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let provider = Address::generate(&env);
    let subscriber = Address::generate(&env);
    let agent = Address::generate(&env);
    let now = env.ledger().timestamp();

    let token_contract = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
    token_client.mint(&subscriber, &200_0000000);

    let netflix = symbol_short!("netflix");
    let spotify = symbol_short!("spotify");

    client.init(
        &provider, &subscriber, &agent, &token_address,
        &50_0000000, &25000, &800_0000, &(now + 604800), &netflix,
    );
    client.init(
        &provider, &subscriber, &agent, &token_address,
        &50_0000000, &25000, &800_0000, &(now + 604800), &spotify,
    );

    assert_eq!(client.get_escrow(&subscriber, &netflix).amount, 50_0000000);
    assert_eq!(client.get_escrow(&subscriber, &spotify).amount, 50_0000000);
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
    let service = symbol_short!("spotify");

    let token_contract = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
    token_client.mint(&subscriber, &100_0000000);

    client.init(
        &provider, &subscriber, &agent, &token_address,
        &100_0000000, &25000, &800_0000, &(now + 10), &service,
    );

    client.record_usage(&subscriber, &service, &40);
    env.ledger().set_timestamp(now + 20);
    client.settle(&subscriber, &service);

    let escrow = client.get_escrow(&subscriber, &service);
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
    let service = symbol_short!("test");

    let token_contract_reg = env.register_stellar_asset_contract_v2(subscriber.clone());
    let token_address = token_contract_reg.address();
    let token_client = StellarAssetClient::new(&env, &token_address);
    let tok = token::Client::new(&env, &token_address);

    let initial_amount: i128 = 100_0000000;
    token_client.mint(&subscriber, &initial_amount);

    let unit_price: i128 = 1_0000000;
    let usage: i128 = 10;

    client.init(
        &provider, &subscriber, &agent, &token_address,
        &initial_amount, &unit_price, &800_0000, &(now + 10), &service,
    );

    assert_eq!(tok.balance(&subscriber), 0);

    client.record_usage(&subscriber, &service, &usage);
    env.ledger().set_timestamp(now + 20);
    client.settle(&subscriber, &service);

    let used_amount = ((usage * unit_price) + 800_0000).min(initial_amount);
    let refund_amount = initial_amount - used_amount;

    assert_eq!(tok.balance(&provider), used_amount);
    assert_eq!(tok.balance(&subscriber), refund_amount);
}
