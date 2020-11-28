import { dedupExchange, fetchExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from "../pages/betterUpdateQuery";
import { cacheExchange } from "@urql/exchange-graphcache"
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

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:5001/graphql",
    fetchOptions: {
        //cookies
        credentials: "include" as const,
    },
    exchanges: [dedupExchange, cacheExchange({
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