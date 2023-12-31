import type { Reducer } from 'redux';

import type { AutoFillSettings, AutoSaveSettings, AutoSuggestSettings } from '@proton/pass/types/worker/settings';
import { partialMerge } from '@proton/pass/utils/object';

import {
    sessionLockDisableSuccess,
    sessionLockEnableSuccess,
    sessionUnlockSuccess,
    settingEditSuccess,
} from '../actions';

export type SettingsState = {
    sessionLockToken?: string;
    sessionLockTTL?: number;
    autofill: AutoFillSettings;
    autosave: AutoSaveSettings;
    autosuggest: AutoSuggestSettings;
    loadDomainImages: boolean;
};

/* proxied settings will also be copied on local
 * storage in order to access them before the booting
 * sequence  (ie: if the user has been logged out) */
export type ProxiedSettings = Omit<SettingsState, 'sessionLockToken' | 'sessionLockTTL'>;

const INITIAL_STATE: SettingsState = {
    autofill: { inject: true, openOnFocus: true },
    autosave: { prompt: true, browserDefault: true },
    autosuggest: { password: true, email: true },
    loadDomainImages: true,
};

const reducer: Reducer<SettingsState> = (state = INITIAL_STATE, action) => {
    if (sessionLockEnableSuccess.match(action)) {
        return partialMerge(state, {
            sessionLockToken: action.payload.storageToken,
            sessionLockTTL: action.payload.ttl,
        });
    }

    if (sessionUnlockSuccess.match(action)) {
        return partialMerge(state, { sessionLockToken: action.payload.storageToken });
    }

    if (sessionLockDisableSuccess.match(action)) {
        return partialMerge(state, { sessionLockToken: undefined, sessionLockTTL: undefined });
    }

    if (settingEditSuccess.match(action)) {
        return partialMerge(state, action.payload);
    }

    return state;
};

export default reducer;
