import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { useGetIntId } from '../../../utils/useGetIntId';
import { withApollo } from '../../../utils/withApollo';

const UpdatePost: React.FC = ({ }) => {
    const router = useRouter();
    const intId = useGetIntId();
    const { data, loading } = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId,
        },
    });
    console.log(data)
    const [updatePost] = useUpdatePostMutation();
    if (loading) {
        return (
            <Layout>Loading...</Layout>
        )
    }

    if (!data?.post) {
        return (
            <div>
                Could not find post
            </div>
        )
    }
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values) => {
                    await updatePost({ variables: { id: intId, ...values } });
                    router.push("/")
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="Title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField width={200} height={150}
                                name="text"
                                placeholder="text..."
                                label="Body"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Update Post
            </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withApollo({ ssr: false })(UpdatePost);