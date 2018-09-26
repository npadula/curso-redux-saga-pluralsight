import {take,put,select,call} from "redux-saga/effects";
import fetch from "isomorphic-fetch";

import {
    TOGGLE_CHECKING_OUT,
    QUANTITY_VERIFICATION_CHECKOUT_PHASE,
    CREDIT_VALIDATION_CHECKOUT_PHASE,
    ERROR_CHECKOUT_PHASE,
    PURCHASE_FINALIZATION_CHECKOUT_PHASE,
    SUCCESS_CHECKOUT_PHASE,
    setCheckoutPhase
} from "../actions";

import {
    currentUserSelector
} from "../selectors";

export function* validateCart(user){
    const response = yield fetch(`http://localhost:8081/cart/validate/${user.get("id")}`);
    const {validated} = yield response.json();
    return validated;
}


export function* executePurchase(user){
    const response = yield fetch(`http://localhost:8081/card/charge/${user.get("id")}`);
    const {success} = yield response.json();
    return success;
}


export function* checkout(){
    const user = yield select(currentUserSelector);

    yield put(setCheckoutPhase(QUANTITY_VERIFICATION_CHECKOUT_PHASE));
    const valid = yield call(validateCart,user);

    if(!valid){
        yield put(setCheckoutPhase(ERROR_CHECKOUT_PHASE));
        return;
    }

    console.log("VALID");


    yield put(setCheckoutPhase(CREDIT_VALIDATION_CHECKOUT_PHASE));
    const creditCardValid = yield call(validateCreditCard,user);      

    if(!creditCardValid){
        yield put(setCheckoutPhase(ERROR_CHECKOUT_PHASE));
        return;
    }

    yield put(setCheckoutPhase(PURCHASE_FINALIZATION_CHECKOUT_PHASE));
    const purchaseSuccessFull = yield call(executePurchase,user);

    if(purchaseSuccessFull){
        yield put(setCheckoutPhase(ERROR_CHECKOUT_PHASE));
        return;
    }

    yield put(setCheckoutPhase(SUCCESS_CHECKOUT_PHASE));


}

export function* validateCreditCard(user){
    const response = yield fetch(`http://localhost:8081/card/validate/${user.get("id")}`);
    const {validated} = yield response.json();
    return validated;
}

export function* checkoutSaga(){
    while(true){
        const isCheckingOut = yield take(TOGGLE_CHECKING_OUT);

        if(isCheckingOut){
            yield call(checkout);
        }
    }
}
