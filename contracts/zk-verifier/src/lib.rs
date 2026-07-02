#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bls12_381::{Bls12381Fr as Fr, Bls12381G1Affine as G1Affine, Bls12381G2Affine as G2Affine},
    vec, Address, Env, Symbol, Vec, symbol_short
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Groth16Error {
    MalformedVerifyingKey = 1,
    InvalidProof = 2,
    NotInitialized = 3,
}

#[derive(Clone)]
#[contracttype]
pub struct VerificationKey {
    pub alpha: G1Affine,
    pub beta: G2Affine,
    pub gamma: G2Affine,
    pub delta: G2Affine,
    pub ic: Vec<G1Affine>,
}

#[derive(Clone)]
#[contracttype]
pub struct Proof {
    pub a: G1Affine,
    pub b: G2Affine,
    pub c: G1Affine,
}

const VK_KEY: Symbol = symbol_short!("vk");

#[contract]
pub struct ZkVerifierContract;

#[contractimpl]
impl ZkVerifierContract {
    pub fn init(env: Env, admin: Address, vk: VerificationKey) {
        admin.require_auth();
        env.storage().instance().set(&VK_KEY, &vk);
    }

    pub fn verify_proof(
        env: Env,
        subscriber: Address,
        proof: Proof,
        pub_signals: Vec<Fr>,
    ) -> Result<bool, Groth16Error> {
        subscriber.require_auth();

        let vk: VerificationKey = env
            .storage()
            .instance()
            .get(&VK_KEY)
            .ok_or(Groth16Error::NotInitialized)?;

        let bls = env.crypto().bls12_381();

        if pub_signals.len() + 1 != vk.ic.len() {
            return Err(Groth16Error::MalformedVerifyingKey);
        }
        let mut vk_x = vk.ic.get(0).unwrap();
        for (s, v) in pub_signals.iter().zip(vk.ic.iter().skip(1)) {
            let prod = bls.g1_mul(&v, &s);
            vk_x = bls.g1_add(&vk_x, &prod);
        }

        let neg_a = -proof.a;
        let vp1 = vec![&env, neg_a, vk.alpha, vk_x, proof.c];
        let vp2 = vec![&env, proof.b, vk.beta, vk.gamma, vk.delta];

        let valid = bls.pairing_check(vp1, vp2);
        
        if valid {
            Ok(true)
        } else {
            Err(Groth16Error::InvalidProof)
        }
    }
}
