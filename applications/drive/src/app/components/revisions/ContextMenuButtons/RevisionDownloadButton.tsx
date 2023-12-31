import { c } from 'ttag';

import { DriveFileRevision } from '@proton/shared/lib/interfaces/drive/file';

import { ContextMenuButton } from '../../sections/ContextMenu';
import { RevisionsProviderState } from '../RevisionsProvider';

interface Props {
    revision: DriveFileRevision;
    downloadRevision: RevisionsProviderState['downloadRevision'];
    close: () => void;
}

const RevisionDownloadButton = ({ revision, downloadRevision, close }: Props) => {
    return (
        <ContextMenuButton
            name={c('Action').t`Download`}
            icon="arrow-down-line"
            testId="context-menu-download"
            action={() => downloadRevision(revision.ID)}
            close={close}
        />
    );
};

export default RevisionDownloadButton;
