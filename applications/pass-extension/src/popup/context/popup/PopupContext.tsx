import { type FC, createContext, useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { c } from 'ttag';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import { NotificationsContext } from '@proton/components';
import { useNotifications } from '@proton/components/hooks';
import { popupMessage } from '@proton/pass/extension/message';
import { selectWorkerSyncing } from '@proton/pass/store';
import * as requests from '@proton/pass/store/actions/requests';
import {
    Maybe,
    Realm,
    RequiredProps,
    WorkerMessageType,
    type WorkerMessageWithSender,
    WorkerStatus,
} from '@proton/pass/types';
import noop from '@proton/utils/noop';

import {
    ExtensionAppContextValue,
    ExtensionContextProvider,
    ExtensionContextState,
} from '../../../shared/components/extension';
import { INITIAL_POPUP_STATE, INITIAL_WORKER_STATE } from '../../../shared/constants';
import { ExtensionContext } from '../../../shared/extension';
import { useExtensionContext } from '../../../shared/hooks';
import { useRequestStatusEffect } from '../../../shared/hooks/useRequestStatusEffect';

export interface PopupContextValue extends ExtensionAppContextValue {
    state: RequiredProps<ExtensionContextState, 'popup'>;
    realm: Maybe<Realm>;
    subdomain: Maybe<string>;
    sync: () => void;
}

export const PopupContext = createContext<PopupContextValue>({
    state: { ...INITIAL_WORKER_STATE, popup: INITIAL_POPUP_STATE },
    realm: undefined,
    subdomain: undefined,
    ready: false,
    logout: noop,
    lock: noop,
    sync: noop,
});

/**
 * PopupContext is an extension of the base
 * ExtensionContext adding specifics for handling
 * syncing behaviours & active tab data.
 */
const ExtendedExtensionContext: FC = ({ children }) => {
    const extensionContext = useExtensionContext();
    const notificationsManager = useContext(NotificationsContext);
    const { createNotification } = useNotifications();
    useEffect(() => notificationsManager.setOffset({ y: 10 }), []);

    const syncing = useSelector(selectWorkerSyncing) || extensionContext.state.status === WorkerStatus.BOOTING;

    const { realm, subdomain } = ExtensionContext.get();

    useRequestStatusEffect(requests.syncing(), {
        onStart: () =>
            createNotification({
                key: requests.syncing(),
                showCloseButton: false,
                text: (
                    <>
                        {c('Info').t`Syncing your vaults…`} <CircleLoader />
                    </>
                ),
            }),
    });

    const popupContext = useMemo<PopupContextValue>(() => {
        const { state, ready } = extensionContext;

        return {
            ...extensionContext,
            state: { ...state, popup: state.popup ?? INITIAL_POPUP_STATE },
            ready: ready && !syncing,
            realm: realm ?? undefined,
            subdomain: subdomain ?? undefined,
        };
    }, [extensionContext, syncing]);

    return <PopupContext.Provider value={popupContext}>{children}</PopupContext.Provider>;
};

export const PopupContextProvider: FC = ({ children }) => {
    const { createNotification, clearNotifications } = useNotifications();

    const onWorkerMessage = (message: WorkerMessageWithSender) => {
        if (message.type === WorkerMessageType.NOTIFICATION) {
            clearNotifications();
            createNotification(message.payload.notification);
        }
    };

    return (
        <ExtensionContextProvider endpoint="popup" messageFactory={popupMessage} onWorkerMessage={onWorkerMessage}>
            <ExtendedExtensionContext>{children}</ExtendedExtensionContext>
        </ExtensionContextProvider>
    );
};
