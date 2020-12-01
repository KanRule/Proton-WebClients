import React from 'react';
import { LabelStack } from 'react-components';

import mdx from './LabelStack.mdx';

export default {
    component: LabelStack,
    title: 'Components / LabelStack',
    parameters: {
        docs: {
            page: mdx,
        },
    },
};

const labelList = `Lorem ipsum dolor sit amet consectetur adipisicing elit`.split(' ').map((name) => ({
    name,
    title: name,
    onClick() {
        alert(`You clicked on "${name}"`);
    },
    onDelete() {
        alert(`You deleted "${name}"`);
    },
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
}));

export const Basic = () => <LabelStack labels={labelList} />;
export const WithDelete = () => <LabelStack labels={labelList} showDelete />;
export const Stacked = () => <LabelStack labels={labelList} isStacked />;
export const Max = () => <LabelStack labels={labelList} maxNumber={5} />;
