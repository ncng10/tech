import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from "next/link"
import { useMeQuery } from "../generated/graphql"
interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery();
    let body = null;

    if (fetching) {
        //data loading
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
            <Button variant="link">Logout</Button>
        </Flex>
    );
}