import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from "../pages/betterUpdateQuery";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache"
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';
import Router from "next/router";

//global errors
export const errorExchage: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            //if the operationresult has an error send a request to sentry
            if (error?.message.includes("not authenticated")) {
                //the error is a combined error with network error and graphqlerrors properties
                Router.replace("/login");
            }
        })
    )
}


export type MergeMode = 'before' | 'after';


const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(
            cache.resolveFieldByKey(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isItInTheCache;
        let hasMore = true;
        const results: string[] = [];
        fieldInfos.forEach((fi) => {
            const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            results.push(...data);
        });

        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results,
        };
    };
}

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:5001/graphql",
    fetchOptions: {
        //cookies
        credentials: "include" as const,
    },
    exchanges: [dedupExchange, cacheExchange({
        keys: {
            PaginatedPosts: () => null,
        },
        resolvers: {
            Query: {
                posts: cursorPagination(),
            },
        },
        updates: {
            Mutation: {
                logout: (_result, args, cache, info) => {
                    //update query, set "mequery" to null 
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        () => ({ me: null })
                    )
                },
                login: (_result, args, cache, info) => {
                    betterUpdateQuery<LoginMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if (result.login.errors) {
                                return query
                            } else {
                                return {
                                    me: result.login.user,
                                };
                            }
                        })
                },
                register: (_result, args, cache, info) => {
                    betterUpdateQuery<RegisterMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if (result.register.errors) {
                                return query
                            } else {
                                return {
                                    me: result.register.user,
                                };
                            }
                        })
                },
            }
        }
    }),
        errorExchage,
        ssrExchange,
        fetchExchange]
});