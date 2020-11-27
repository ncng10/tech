//[loremipsum] is a naming convention in next-js for variable urls
// name in brackets is the token
//folder name part of the url before the token
import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from "next/link"
const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    const [, changePassword] = useChangePasswordMutation();
    const router = useRouter();
    const [tokenError, setTokenError] = useState("");
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token,
                    });
                    if (response.data?.changePassword.errors) {
                        //fails
                        const errorMap = toErrorMap(response.data.changePassword.errors)
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token)
                        } else {
                            setErrors(errorMap)
                        }
                        setErrors(toErrorMap(response.data.changePassword.errors));
                    } else if (response.data?.changePassword.user) {
                        //worked
                        router.push("/")
                    }
                }}
            >
                {
                    ({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="newPassword"
                                placeholder="New Password"
                                label="New Password"
                                type="password"
                            />
                            {tokenError ?
                                <Box>
                                    <Box style={{ color: 'red' }}>{tokenError}</Box>
                                    <NextLink href="/forgot-password">
                                        <Link>Go forget it again</Link>
                                    </NextLink>

                                </Box>
                                : null}
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                                Change Password
        </Button>
                        </Form>
                    )
                }
            </Formik>
        </Wrapper >
    );
}

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword)
