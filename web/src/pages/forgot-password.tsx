import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { useState } from 'react';
import { withApollo } from '../utils/withApollo';


const ForgotPassword: React.FC<{}> = ({ }) => {
    const [complete, setComplete] = useState(false)
    const [forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgotPassword({ variables: values });
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) =>
                    complete ? (
                        <Box>
                            if an account with that email exists, we sent you can email
                        </Box>
                    ) : (
                            <Form>
                                <InputField
                                    name="email"
                                    placeholder="email"
                                    label="Email"
                                    type="email"
                                />
                                <Button
                                    mt={4}
                                    type="submit"
                                    isLoading={isSubmitting}
                                    variantColor="teal"
                                >
                                    forgot password
                </Button>
                            </Form>
                        )
                }
            </Formik>
        </Wrapper>
    );
};

export default withApollo({ ssr: false })(ForgotPassword);