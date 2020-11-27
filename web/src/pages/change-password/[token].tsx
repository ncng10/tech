//[loremipsum] is a naming convention in next-js for variable urls
// name in brackets is the token
//folder name part of the url before the token
import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import React from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values);
                    if (response.data?.login.errors) {
                        //fails
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user) {
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
        </Wrapper>
    );
}

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string
    }
}

export default ChangePassword
