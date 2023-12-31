import type { ReactNode, VFC } from 'react';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import type { ProxiedSettings } from '@proton/pass/store/reducers/settings';
import type { MaybeNull } from '@proton/pass/types';

import type { NotificationSetActionPayload } from '../../../../types';
import { NotificationAction } from '../../../../types';
import { Autosave } from './Autosave';

type Props = {
    children?: ReactNode;
    settings: ProxiedSettings;
    state: MaybeNull<NotificationSetActionPayload>;
    onClose?: () => void;
};

export const NotificationSwitch: VFC<Props> = ({ children, state, settings, onClose }) => {
    return (
        <div className="h100 p-5 bg-norm relative">
            {children}
            {(() => {
                if (state === null) return <CircleLoader className="absolute absolute-center m-auto" />;

                switch (state.action) {
                    case NotificationAction.AUTOSAVE_PROMPT: {
                        return <Autosave submission={state.submission} settings={settings} onClose={onClose} />;
                    }
                }
            })()}
        </div>
    );
};
