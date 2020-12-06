import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from "next/link";
import { useRouter } from 'next/router';
import React from 'react';
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    let body = null;

    if (fetching) {
        //data loading
        //user not logged in
    } else if (!data?.me) {
        //user not logged in
        body = (
            <React.Fragment>
                <NextLink href="/login">
                    <Link color="white" mr={2}>
                        Login
                    </Link>
                </NextLink>
                <NextLink href="register">
                    <Link color="white">
                        Register
                </Link>
                </NextLink>
            </React.Fragment>)
    } else {
        //user is logged in
        body = <Box>{data.me.username}</Box>
    }
    return (
        <Flex bg="lightcoral" p={4} ml={"auto"}>
            <Box mr={2} ml={"auto"}>
                {body}
            </Box>
            <Button onClick={async () => {
                await logout();
                router.reload();
            }}
                isLoading={logoutFetching}
                variant="link">Logout</Button>
        </Flex>
    );
}