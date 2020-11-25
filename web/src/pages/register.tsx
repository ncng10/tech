import React from "react";
import { Formik, Form } from "formik";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useMutation } from "urql";
import { useRegisterMutation } from "../generated/graphql";
import { responsePathAsArray } from "graphql";

interface registerProps { }



const Register: React.FC<registerProps> = ({ }) => {
    const [, register] = useRegisterMutation();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values) => {
                    const response = await register(values);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            register
            </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Register;