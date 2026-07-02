pragma circom 2.1.6;

include "node_modules/circomlib/circuits/comparators.circom";

template BalanceCheck() {
    signal input balance;
    signal input required_minimum;
    
    component geq = GreaterEqThan(64);
    geq.in[0] <== balance;
    geq.in[1] <== required_minimum;
    
    geq.out === 1;
}

component main {public [required_minimum]} = BalanceCheck();
