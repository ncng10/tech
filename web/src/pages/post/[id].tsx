import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post: React.FC = ({ }) => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    })
    if (fetching) {
        return (
            <Layout>Loading...</Layout>
        )
    }
    return (
        <React.Fragment>
            <Layout>
                <div>{data?.post?.title}</div>
                {data?.post?.text}
            </Layout>
        </React.Fragment>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);