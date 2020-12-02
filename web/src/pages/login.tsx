import React from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button, Link } from "@chakra-ui/react";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from 'next/router'
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
interface loginProps { }



const Login: React.FC<loginProps> = ({ }) => {
    const router = useRouter();
    const home = "/"
    const [, login] = useLoginMutation();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ userNameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values);
                    if (response.data?.login.errors) {
                        //fails
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user) {
                        //worked

                        //if user is logged out and tries to create
                        //a post, instead of going back to home page
                        //after logging in, it will take them to the
                        //page of creating a post
                        //only if they clicked the link to do so
                        if (typeof router.query.next === "string") {
                            router.push(router.query.next);
                        }
                    } else {
                        router.push(home)
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="userNameOrEmail"
                            placeholder="Username or Email"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <NextLink href="/forgot-password">
                            <Link>Forgot Password?</Link>
                        </NextLink>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Login
            </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Login);