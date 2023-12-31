import { useState } from 'react';

import { c } from 'ttag';

import { Folder } from '@proton/shared/lib/interfaces/Folder';
import { Label } from '@proton/shared/lib/interfaces/Label';
import clsx from '@proton/utils/clsx';

import { SimpleFilterModalModel } from '../interfaces';
import FilterPreviewActions from './FilterPreviewActions';
import FilterPreviewConditions from './FilterPreviewConditions';

interface Props {
    labels: Label[];
    folders: Folder[];
    isNarrow: boolean;
    model: SimpleFilterModalModel;
}

const FilterPreview = ({ isNarrow, labels, folders, model }: Props) => {
    const [conditionsOpen, setConditionsOpen] = useState(true);
    const [actionsOpen, setActionsOpen] = useState(true);

    return (
        <>
            <div className="border-bottom">
                <div className="flex flex-nowrap on-mobile-flex-column align-items-center pb-4">
                    <div className={clsx(['w20 pt-2', isNarrow && 'mb-4'])}>
                        <span className={clsx(['mr-2', !isNarrow && 'ml-2'])}>{c('Label').t`Filter Name`}</span>
                    </div>
                    <div
                        title={model.name}
                        className={clsx(['pt-2 flex flex-column flex-item-fluid max-w100', !isNarrow && 'ml-4'])}
                    >
                        <span className="max-w100 text-ellipsis">{model.name}</span>
                    </div>
                </div>
            </div>
            <FilterPreviewConditions
                isNarrow={isNarrow}
                model={model}
                isOpen={conditionsOpen}
                toggleOpen={() => setConditionsOpen(!conditionsOpen)}
            />
            <FilterPreviewActions
                isNarrow={isNarrow}
                labels={labels}
                folders={folders}
                model={model}
                isOpen={actionsOpen}
                toggleOpen={() => setActionsOpen(!actionsOpen)}
            />
        </>
    );
};

export default FilterPreview;
