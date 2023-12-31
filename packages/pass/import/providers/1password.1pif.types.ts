import type { OnePassFieldType, OnePassLoginDesignation } from './1password.1pux.types';

export enum OnePassLegacyItemType {
    LOGIN = 'webforms.WebForm',
    NOTE = 'securenotes.SecureNote',
    PASSWORD = 'passwords.Password',
}
export enum OnePassLegacySectionFieldKey {
    CONCEALED = 'concealed',
    STRING = 'string',
    URL = 'URL',
}

export type OnePassLegacyField = {
    value: string;
    type: OnePassFieldType;
    designation?: OnePassLoginDesignation;
};

export type OnePassLegacySectionField = {
    k: OnePassLegacySectionFieldKey;
    n: string;
    v?: string;
    t: string;
};

export type OnePassLegacySection = {
    title?: string;
    name: string;
    fields?: OnePassLegacySectionField[];
};

export type OnePassLegacyURL = {
    label?: string;
    url: string;
};

export type OnePassLegacyItem = {
    uuid: string;
    typeName: OnePassLegacyItemType | string;
    createdAt: number;
    updatedAt: number;
    location?: string;
    title: string;
    secureContents: {
        password?: string;
        notesPlain?: string;
        sections?: OnePassLegacySection[];
        fields?: OnePassLegacyField[];
        URLs?: OnePassLegacyURL[];
    };
};
