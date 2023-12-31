import { type FormEntry, FormEntryStatus } from '@proton/pass/types';

export const isSubmissionCommitted = (submission: FormEntry): submission is FormEntry<FormEntryStatus.COMMITTED> =>
    submission.status === FormEntryStatus.COMMITTED;

export const canCommitSubmission = (submission: FormEntry): submission is FormEntry<FormEntryStatus.COMMITTED> =>
    submission.partial === false && isSubmissionCommitted(submission);
