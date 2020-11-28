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
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName); //filters items to make sure only posts are selected
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
        const isItInTheCache = cache.resolveFieldByKey(entityKey, fieldKey);
        info.partial = !isItInTheCache;
        const results: string[] = [];
        fieldInfos.forEach((fi) => {
            const data = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string[]; //from query, get posts on field key. field key is the name of post and the arugments (limit etc)
            results.push(...data);
        });

        return results

        // const visited = new Set();
        // let result: NullArray<string> = [];
        // let prevOffset: number | null = null;

        // for (let i = 0; i < size; i++) {
        //     const { fieldKey, arguments: args } = fieldInfos[i];
        //     if (args === null || !compareArgs(fieldArgs, args)) {
        //         continue;
        //     }

        //     const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
        //     const currentOffset = args[cursorArgument];

        //     if (
        //         links === null ||
        //         links.length === 0 ||
        //         typeof currentOffset !== 'number'
        //     ) {
        //         continue;
        //     }

        //     const tempResult: NullArray<string> = [];

        //     for (let j = 0; j < links.length; j++) {
        //         const link = links[j];
        //         if (visited.has(link)) continue;
        //         tempResult.push(link);
        //         visited.add(link);
        //     }

        //     if (
        //         (!prevOffset || currentOffset > prevOffset) ===
        //         (mergeMode === 'after')
        //     ) {
        //         result = [...result, ...tempResult];
        //     } else {
        //         result = [...tempResult, ...result];
        //     }

        //     prevOffset = currentOffset;
        // }

        // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        // if (hasCurrentPage) {
        //     return result;
        // } else if (!(info as any).store.schema) {
        //     return undefined;
        // } else {
        //     info.partial = true;
        //     return result;
    }
};

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:5001/graphql",
    fetchOptions: {
        //cookies
        credentials: "include" as const,
    },
    exchanges: [dedupExchange, cacheExchange({
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