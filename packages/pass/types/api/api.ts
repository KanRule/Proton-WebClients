import type { Subscriber } from '@proton/pass/utils/pubsub';
import type { RefreshSessionResponse } from '@proton/shared/lib/authentication/interface';
import type { ProtonConfig } from '@proton/shared/lib/interfaces';

import type { Maybe } from '../utils';
import type { ApiResponse } from './pass';

export type ApiCreateOptions = {
    config: ProtonConfig;
    auth?: ApiAuthOptions;
    onSessionRefresh?: (result: RefreshSessionResponse) => void;
};

export type ApiCallFn = (options: ApiOptions) => Promise<Response>;

export type ApiAuthOptions = {
    UID: string;
    AccessToken: string;
    RefreshToken: string;
};

export type ApiStatus = {
    serverTime?: Date;
    offline: boolean;
    unreachable: boolean;
    appVersionBad: boolean;
    sessionInactive: boolean;
    sessionLocked: boolean;
};

export type ApiContext = {
    call: ApiCallFn;
    auth?: ApiAuthOptions;
    status: ApiStatus;
};

/**
 * This generic Api type lets us :
 * - Infer the Api response type from the auto-generated swagger
 *   types by only looking at the options's method and url
 * - Hard-cast the response type when dealing with API urls
 *   that have not been auto-generated (legacy support)
 * - Add a mapResponse option to an API's query parameters in order
 *   to transform the response on the fly (while maintaining
 *   type-safety) when interfacing our API results with shared
 *   code (ie: eventsManager needs the response body to respect
 *   a certain format that our events API does not)
 */
export type Api = {
    <
        T extends any = void,
        U extends string = string,
        M extends string = string,
        F extends ApiResponseMapper<T, U, M> = undefined
    >(
        config: ApiOptions<T, U, M, F>
    ): Promise<ApiResult<T, U, M, F>>;
    configure: (auth?: ApiAuthOptions) => void;
    subscribe: (subscribe: Subscriber<ApiSubscribtionEvent>) => () => void;
    unsubscribe: () => void;
    getAuth: () => Maybe<ApiAuthOptions>;
    getStatus: () => ApiStatus;
};

export type ApiOptions<
    T extends any = void,
    U extends string = string,
    M extends string = string,
    F extends ApiResponseMapper<T, U, M> = undefined
> = {
    [option: string]: any;
} & {
    output?: 'json' | 'raw' | 'stream';
    url?: U;
    method?: M;
    mapResponse?: F;
    headers?: { [key: string]: string };
    params?: { [key: string]: any };
    silent?: boolean;
};

export type ApiResult<
    T extends any = void,
    U extends string = string,
    M extends string = string,
    F extends ApiResponseMapper<T, U, M> = undefined
> = F extends (...args: any[]) => infer U ? U : T extends void ? ApiResponse<`${U}`, `${M}`> : T;

export type ApiResponseMapper<T extends any = void, U extends string = string, M extends string = string> = Maybe<
    (response: T extends void ? ApiResponse<`${U}`, `${M}`> : T) => any
>;

export type ApiSubscribtionEvent =
    | { type: 'session'; status: 'inactive' | 'locked' }
    | { type: 'error'; error: string };
