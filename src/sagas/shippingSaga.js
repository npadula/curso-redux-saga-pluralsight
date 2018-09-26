import {select,put, takeLatest} from "redux-saga/effects";

import fetch from "isomorphic-fetch";


import {
    SET_CART_ITEMS,
    INCREASE_ITEM_QUANTITY,
    DECREASE_ITEM_QUANTITY,
    FETCHED,
    FETCHING,
    setShippingFetchStatus,
setShippingCost
} from "../actions";


import {
    cartItemsSelector
} from "../selectors";


function* shipping(){
    yield put(setShippingFetchStatus(FETCHING));
    const items = yield select(cartItemsSelector);
    const itemRequestString = items.reduce((string,item) => {
        for(let i = 0; i< item.get("quantity"); i++){
            
            if(i == item.get("quantity"))
                string += item.get("id");
            else
                string += item.get("id") + ",";
        }

        return string;
    },"").replace(/,\s*$/,'');

    const response = yield fetch(`http://localhost:8081/shipping/${itemRequestString}`);
    const {total} = yield response.json();
    yield put(setShippingCost(total));
    yield put(setShippingFetchStatus(FETCHED));

    console.log(itemRequestString);

}

export function* shippingSaga(){
    yield takeLatest([SET_CART_ITEMS, INCREASE_ITEM_QUANTITY,DECREASE_ITEM_QUANTITY], shipping);
}
