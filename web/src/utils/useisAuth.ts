import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const { data, loading } = useMeQuery();
    const router = useRouter();
    console.log(router) //shows route of page
    useEffect(() => {
        //if user is not logged in, redirect to login
        if (!loading && !data?.me) {
            router.replace("/login?next=" + router.pathname); //query parameter
        }
    }, [loading, data, router])
}