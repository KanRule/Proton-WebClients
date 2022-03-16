import { useEffect, useMemo } from 'react';
import { c } from 'ttag';

import { useLoading, useNotifications } from '@proton/components';
import { SORT_DIRECTION } from '@proton/shared/lib/constants';
import { SearchSortField } from '@proton/shared/lib/interfaces/drive/fileBrowser';

import { useUserSettings } from '../settings';
import { LinkType, useLinksListing } from '../links';
import { useSearchResults } from '../search';
import { reportError } from '../utils';
import { useMemoArrayNoMatterTheOrder, useAbortSignal, useSelection, useSorting, useSortingWithDefault } from './utils';

const DEFAULT_SORT = {
    sortField: 'name' as SearchSortField,
    sortOrder: SORT_DIRECTION.ASC,
};

/**
 * useSearchView provides data for search view (file browser of search results).
 *
 * At this moment, we show only fully loaded results, that means results are
 * picked up from cache and fetched from API if they are missing. But because
 * we have quite enough data in index database, we could show and sort results
 * right away. Probably the best way would be to allow paging over search
 * results so we dont have to load everything if not needed; that way we could
 * fetch data from API only for the pages which user scrolled to. The issue is,
 * modify date, sharing info, or thumbnail is not available and we would need
 * some clever placeholder in the UI. We don't know for now how to tackle this
 * in general (it is needed also on shared links page), therefore we start with
 * simple algorithm and we improve in the future.
 */
export default function useSearchView(shareId: string, query: string) {
    const { createNotification } = useNotifications();
    const { layout } = useUserSettings();

    const { runSearch, dbExists, isSearching, results } = useSearchResults();
    const cachedResults = useMemoArrayNoMatterTheOrder(results);
    const searchResults = useMemo(() => {
        return cachedResults.map((esLink) => ({
            linkId: esLink.linkId,
            type: esLink.MIMEType === 'Folder' ? LinkType.FOLDER : LinkType.FILE,
            name: esLink.decryptedName,
            mimeType: esLink.MIMEType,
            size: esLink.size,
            metaDataModifyTime: esLink.modifiedTime,
            // These fields are not kept in index db, but its fine that its not
            // possible to sort by them, we need load for now everything anyway.
            fileModifyTime: esLink.modifiedTime,
            trashed: null,
        }));
    }, [cachedResults]);
    const {
        sortedList: sortedSearchResults,
        sortParams,
        setSorting,
    } = useSortingWithDefault(searchResults, DEFAULT_SORT);
    const sortedSearchResultIds = useMemo(() => {
        return sortedSearchResults.map(({ linkId }) => linkId);
    }, [sortedSearchResults]);

    const abortSignal = useAbortSignal([shareId, query]);
    const linksListing = useLinksListing();
    const { links, isDecrypting } = linksListing.getCachedLinks(abortSignal, query, shareId, sortedSearchResultIds);
    const cachedLinks = useMemoArrayNoMatterTheOrder(links);

    // For now we don't show trashed items in search results. We index them
    // so we are free to experiemnt with showing them without need to re-index
    // the whole db every time. But trashed items don't have the same options
    // in toolbar or context menu, which could be confusing.
    const cachedLinksWithoutTrashedItems = useMemo(() => {
        return cachedLinks.filter(({ trashed }) => !trashed);
    }, [cachedLinks]);

    const sortedLinks = useSorting(cachedLinksWithoutTrashedItems, sortParams);
    const sortedLinksForSelection = useMemo(() => {
        return sortedLinks.map((item) => ({
            id: item.linkId,
            disabled: item.isLocked,
            data: item,
        }));
    }, [sortedLinks]);
    const selectionControls = useSelection(sortedLinksForSelection);

    const [isFetchLoading, withLoading] = useLoading(true);

    useEffect(() => {
        // Wait till database is indexed and loaded. If db does not exist
        // yet and runSearch is called, no results is returned and it will
        // not be automatically updated.
        if (!dbExists) {
            return;
        }
        runSearch(query).catch((err) => {
            createNotification({
                type: 'error',
                text: c('Error').t`Search failed`,
            });
            reportError(err);
        });
    }, [dbExists, query]);

    // Load links using sorted search results so we load items in the best
    // possible order.
    useEffect(() => {
        const ac = new AbortController();
        void withLoading(linksListing.loadLinks(ac.signal, query, shareId, sortedSearchResultIds));
        return () => {
            ac.abort();
        };
    }, [shareId, query, sortedSearchResultIds]);

    return {
        layout,
        numberOfResults: sortedLinks.length,
        items: sortedLinks,
        sortParams,
        setSorting,
        selectionControls,
        isLoading: isSearching || isFetchLoading || isDecrypting,
    };
}
