import { type FC, useState } from 'react';

import type { FormikContextType } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, Option } from '@proton/components';
import type { AliasMailbox } from '@proton/pass/types';

import type { AliasFormValues } from '../../../../shared/form/types';
import type { UseAliasOptionsResult } from '../../../../shared/hooks/useAliasOptions';
import { Field } from '../../../components/Field/Field';
import { FieldsetCluster } from '../../../components/Field/Layout/FieldsetCluster';
import { SelectField } from '../../../components/Field/SelectField';
import { TextField } from '../../../components/Field/TextField';

type AliasFormProps<V extends AliasFormValues> = {
    form: FormikContextType<V>;
    aliasOptions: UseAliasOptionsResult['aliasOptions'];
    loading: boolean;
};

const AliasFormBase: FC<{
    disabled: boolean;
    loading: boolean;
    mailboxes: AliasMailbox[];
    toggleShowAdvanced: () => void;
}> = ({ children, disabled, loading, mailboxes, toggleShowAdvanced }) => {
    return (
        <>
            <div className="flex flex-justify-end mb-2">
                <Button shape="ghost" onClick={toggleShowAdvanced}>
                    <span className="flex flex-align-items-center color-weak text-sm">
                        <Icon name="cog-wheel" className="mr-1" />
                        {c('Action').t`Advanced options`}
                    </span>
                </Button>
            </div>
            {children}
            <FieldsetCluster>
                <Field
                    name="mailboxes"
                    label={c('Label').t`Forwards to`}
                    placeholder={c('Label').t`Select an email address`}
                    component={SelectField}
                    icon="arrow-up-and-right-big"
                    multiple
                    disabled={disabled || mailboxes.length <= 1}
                    loading={loading}
                >
                    {mailboxes.map((mailbox) => (
                        <Option value={mailbox} title={mailbox.email} key={mailbox.id}>
                            {mailbox.email}
                        </Option>
                    ))}
                </Field>
            </FieldsetCluster>
        </>
    );
};

export const AliasForm = <V extends AliasFormValues>({ form, loading, aliasOptions }: AliasFormProps<V>) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const toggleShowAdvanced = () => setShowAdvanced((state) => !state);
    const disabled = loading || aliasOptions === null;

    const wrapperProps = {
        disabled,
        loading,
        mailboxes: aliasOptions?.mailboxes ?? [],
        toggleShowAdvanced,
    };

    return showAdvanced ? (
        <AliasFormBase {...wrapperProps}>
            <FieldsetCluster>
                <Field
                    name="aliasPrefix"
                    label={c('Label').t`Prefix`}
                    placeholder={c('Placeholder').t`Enter a prefix`}
                    component={TextField}
                    onFocus={() => form.setFieldTouched('aliasPrefix', true)}
                />
                <Field
                    name="aliasSuffix"
                    label={c('Label').t`Suffix`}
                    placeholder={c('Placeholder').t`Select a suffix`}
                    component={SelectField}
                    disabled={disabled}
                    loading={loading}
                >
                    {(aliasOptions?.suffixes ?? []).map((suffix) => (
                        <Option key={suffix.value} value={suffix} title={suffix.value}>
                            {suffix.value}
                        </Option>
                    ))}
                </Field>
            </FieldsetCluster>
        </AliasFormBase>
    ) : (
        <AliasFormBase {...wrapperProps} />
    );
};
