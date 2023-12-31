import type { Reducer } from 'redux';

import type { Feature } from '@proton/components/containers';
import type { MaybeNull, PassPlanResponse } from '@proton/pass/types';
import { EventActions } from '@proton/pass/types';
import type { PassFeature } from '@proton/pass/types/api/features';
import { fullMerge, merge, objectDelete, partialMerge } from '@proton/pass/utils/object';
import type { Address, User } from '@proton/shared/lib/interfaces';

import { bootSuccess, serverEvent, setUserFeatures, setUserPlan } from '../actions';

export type AddressState = { [addressId: string]: Address };
export type UserFeatureState = Partial<Record<PassFeature, Feature>> & { requestedAt?: number };
export type UserPlanState = PassPlanResponse & { requestedAt?: number };

export type UserState = {
    eventId: MaybeNull<string>;
    user: MaybeNull<User>;
    addresses: AddressState;
    plan: MaybeNull<UserPlanState>;
    features: MaybeNull<UserFeatureState>;
};

const initialState: UserState = { user: null, addresses: {}, eventId: null, plan: null, features: null };

const reducer: Reducer<UserState> = (state = initialState, action) => {
    if (bootSuccess.match(action)) {
        return fullMerge(state, {
            user: action.payload.user,
            addresses: action.payload.addresses,
            eventId: action.payload.eventId,
            plan: action.payload.plan,
            features: action.payload.features,
        });
    }

    if (serverEvent.match(action) && action.payload.event.type === 'user') {
        const { Addresses = [], User, EventID } = action.payload.event;

        return {
            ...(User ? partialMerge(state, { user: User }) : state),
            eventId: EventID ?? null,
            addresses: Addresses.reduce(
                (acc, { Action, ID, Address }) =>
                    Action === EventActions.DELETE ? objectDelete(acc, ID) : merge(acc, { [ID]: Address }),
                state.addresses
            ),
        };
    }

    if (setUserPlan.match(action)) return partialMerge(state, { plan: action.payload });
    if (setUserFeatures.match(action)) return partialMerge(state, { features: action.payload });

    return state;
};

export default reducer;
