import { c } from 'ttag';



import { Button } from '@proton/atoms/Button';
import { FileIcon, Icon, TableCell, useActiveBreakpoint } from '@proton/components';
import clsx from '@proton/utils/clsx';

import usePublicToken from '../../../hooks/drive/usePublicToken';
import { useDownload } from '../../../store';
import { isTransferActive, isTransferPaused } from '../../../utils/transfer';
import { Cells, HeaderCellsPresets } from '../../FileBrowser';
import { getLinkIconText } from '../../sections/FileBrowser/utils';
import { PublicLink } from '../interface';

export const headerCellsDesktop = [
    {
        type: HeaderCellsPresets.Checkbox,
    },
    {
        type: 'name',
        getText: () => c('Label').t`Name`,
        sorting: true,
    },
    {
        type: 'size',
        getText: () => c('Label').t`Size`,
        props: {
            className: 'w11e text-right',
        },
        sorting: true,
    },
    {
        type: HeaderCellsPresets.Placeholder,
        props: {
            className: 'w11e',
        },
    },
];
export const headerCellsMobile = headerCellsDesktop.slice(0, -1);

export const contentCellsDesktop: React.FC<{ item: PublicLink }>[] = [
    Cells.CheckboxCell,
    NameCell,
    SizeCell,
    DownloadCell,
];
export const contentCellsMobile = contentCellsDesktop.slice(0, -1);

function NameCell({ item }: { item: PublicLink }) {
    const iconText = getLinkIconText({
        linkName: item.name,
        mimeType: item.mimeType,
        isFile: item.isFile,
    });

    return (
        <TableCell className="m-0 flex flex-align-items-center flex-nowrap flex-item-fluid" data-testid="column-name">
            {item.cachedThumbnailUrl ? (
                <img
                    src={item.cachedThumbnailUrl}
                    alt={iconText}
                    className="file-browser-list-item--thumbnail flex-item-noshrink mr-2"
                />
            ) : (
                <FileIcon mimeType={item.isFile ? item.mimeType : 'Folder'} alt={iconText} className="mr-2" />
            )}
            <Cells.NameCell name={item.name} />
        </TableCell>
    );
}

function SizeCell({ item }: { item: PublicLink }) {
    const { isNarrow } = useActiveBreakpoint();

    if (item.progress) {
        return (
            <TableCell className="m-0 w11e flex flex-nowrap flex-justify-end" data-testid="column-size">
                {!isNarrow && item.progress.progress > 0 && (
                    <>
                        <Cells.SizeCell size={item.progress.progress} />/
                    </>
                )}
                {item.progress.total !== undefined ? <Cells.SizeCell size={item.progress.total} /> : '-'}
            </TableCell>
        );
    }

    const className = isNarrow ? 'w6e' : 'w11e';

    return (
        <TableCell className={`m-0 flex flex-nowrap flex-justify-end ${className}`} data-testid="column-size">
            {item.isFile ? <Cells.SizeCell size={item.size} /> : '-'}
        </TableCell>
    );
}

function DownloadCell({ item }: { item: PublicLink }) {
    const { token } = usePublicToken();
    const { download, downloads, clearDownloads } = useDownload();

    const isCurrentInProgress = Boolean(item.progress);

    const handleClick = () => {
        clearDownloads();

        void download([{ ...item, shareId: token }]);
    };

    const isAnyInProgress = downloads.some((transfer) => isTransferActive(transfer) || isTransferPaused(transfer));

    const className = clsx([
        'flex-item-centered-vert ',
        'file-browser-list--download-button',
        'opacity-on-hover-only-desktop',
    ]);

    return (
        <TableCell
            className="m-0 flex flex-nowrap flex-justify-end file-browser-list--icon-column w11e"
            data-testid="column-size"
        >
            <Button
                className={className}
                shape="ghost"
                size="small"
                onClick={handleClick}
                loading={isCurrentInProgress}
                disabled={isAnyInProgress && !isCurrentInProgress}
            >
                <span>{c('Action').t`Download`}</span>
                {!isCurrentInProgress ? <Icon name="arrow-down-line" className="ml-2" /> : null}
            </Button>
        </TableCell>
    );
}