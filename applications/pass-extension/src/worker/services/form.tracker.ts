import type { FormEntry, FormIdentifier, Maybe, Realm, TabId, WithAutoSavePromptOptions } from '@proton/pass/types';
import { FormEntryStatus, WorkerMessageType } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { merge } from '@proton/pass/utils/object';
import { parseSender } from '@proton/pass/utils/url';

import { canCommitSubmission, isSubmissionCommitted } from '../../shared/form';
import WorkerMessageBroker from '../channel';
import { withContext } from '../context';
import { createMainFrameRequestTracker } from './main-frame.tracker';
import { createXMLHTTPRequestTracker } from './xmlhttp-request.tracker';

const isPartialFormData = ({ type, data }: Pick<FormEntry, 'data' | 'type'>): boolean => {
    if (type === 'login') {
        return data.password === undefined || data.password.trim() === '';
    }

    return false;
};

const getFormId = (tabId: TabId, realm: Realm): FormIdentifier => `${tabId}:${realm}`;

export const createFormTrackerService = () => {
    const submissions: Map<FormIdentifier, FormEntry> = new Map();

    const get = (tabId: TabId, realm: string): FormEntry | undefined => {
        const submission = submissions.get(getFormId(tabId, realm));
        if (submission && submission.realm === realm) {
            return submission;
        }
    };

    const stash = (tabId: TabId, realm: string, reason: string): void => {
        const formId = getFormId(tabId, realm);

        if (submissions.has(formId)) {
            logger.info(`[FormTracker::Stash]: on tab ${tabId} for realm "${realm}" {${reason}}`);
            submissions.delete(formId);
        }
    };

    const stage = (tabId: TabId, submission: Omit<FormEntry, 'status' | 'partial'>, reason: string): FormEntry => {
        logger.info(`[FormTracker::Stage]: on tab ${tabId} for realm "${submission.realm}" {${reason}}`);

        const formId = getFormId(tabId, submission.realm);
        const pending = submissions.get(formId);

        if (pending !== undefined && pending.status === FormEntryStatus.STAGING) {
            const update = merge(pending, { ...submission, status: FormEntryStatus.STAGING });
            const staging = merge(update, { partial: isPartialFormData(update) });

            submissions.set(formId, staging);
            return staging;
        }

        const staging = merge(submission, {
            status: FormEntryStatus.STAGING,
            partial: isPartialFormData(submission),
        }) as FormEntry;

        submissions.set(formId, staging);
        return staging;
    };

    const commit = (tabId: TabId, realm: string, reason: string): Maybe<FormEntry<FormEntryStatus.COMMITTED>> => {
        const formId = getFormId(tabId, realm);
        const pending = submissions.get(formId);

        if (pending !== undefined && pending.status === FormEntryStatus.STAGING) {
            logger.info(`[FormTracker::Commit] on tab ${tabId} for realm "${realm}" {${reason}}`);
            const commit = merge(pending, { status: FormEntryStatus.COMMITTED });

            if (canCommitSubmission(commit)) {
                submissions.set(formId, commit);
                return commit;
            }
        }
    };

    createMainFrameRequestTracker({
        onTabDelete: (tabId) => {
            submissions.forEach((_, key) => {
                if (key.startsWith(tabId.toString())) {
                    const [tabId, realm] = key.split(':');
                    stash(parseInt(tabId, 10), realm, 'TAB_DELETED');
                }
            });
        },
        onTabError: (tabId, realm) => realm && stash(tabId, realm, 'TAB_ERRORED'),
    });

    /**
     * TODO: on failed request we should send out
     * a message to the content-script : we should stash
     * only if there was a recent form submission - if
     * we directly stash we might get false positives
     */
    createXMLHTTPRequestTracker({
        shouldTakeRequest: (tabId, realm) => submissions.has(getFormId(tabId, realm)),
        onFailedRequest: (tabId, realm) => stash(tabId, realm, 'XMLHTTP_ERROR_DETECTED'),
    });

    WorkerMessageBroker.registerMessage(
        WorkerMessageType.FORM_ENTRY_STAGE,
        withContext((ctx, { payload }, sender) => {
            const { type, data } = payload;

            if (ctx.getState().loggedIn) {
                const { tabId, realm, subdomain, url } = parseSender(sender);
                return { staged: stage(tabId, { realm, subdomain, url, type, data }, payload.reason) };
            }

            throw new Error('Cannot stage submission while logged out');
        })
    );

    WorkerMessageBroker.registerMessage(
        WorkerMessageType.FORM_ENTRY_STASH,
        withContext((ctx, { payload: { reason } }, sender) => {
            if (ctx.getState().loggedIn) {
                const { tabId, realm } = parseSender(sender);
                stash(tabId, realm, reason);
                return true;
            }

            return false;
        })
    );

    WorkerMessageBroker.registerMessage(
        WorkerMessageType.FORM_ENTRY_COMMIT,
        withContext((ctx, { payload: { reason } }, sender) => {
            if (ctx.getState().loggedIn) {
                const { tabId, realm } = parseSender(sender);
                const committed = commit(tabId, realm, reason);

                if (committed !== undefined) {
                    const promptOptions = ctx.service.autosave.resolvePromptOptions(committed);

                    return promptOptions.shouldPrompt
                        ? { committed: merge(committed, { autosave: promptOptions }) }
                        : { committed: undefined };
                }

                throw new Error(`Cannot commit form submission for tab#${tabId} on realm "${realm}"`);
            }

            throw new Error('Cannot commit submission while logged out');
        })
    );

    WorkerMessageBroker.registerMessage(
        WorkerMessageType.FORM_ENTRY_REQUEST,
        withContext((ctx, _, sender) => {
            if (ctx.getState().loggedIn) {
                const { tabId, realm } = parseSender(sender);
                const submission = get(tabId, realm);
                const isCommitted = submission !== undefined && isSubmissionCommitted(submission);

                return {
                    submission:
                        submission !== undefined
                            ? (merge(submission, {
                                  autosave: isCommitted
                                      ? ctx.service.autosave.resolvePromptOptions(submission)
                                      : { shouldPrompt: false },
                              }) as WithAutoSavePromptOptions<FormEntry>)
                            : submission,
                };
            }

            return { submission: undefined };
        })
    );

    const clear = () => {
        logger.info(`[FormTracker::Clear]: removing every submission`);
        submissions.clear();
    };

    return { get, stage, stash, commit, clear };
};

export type FormTrackerService = ReturnType<typeof createFormTrackerService>;
