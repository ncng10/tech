import { withUrqlClient } from 'next-urql';
import React from 'react'
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post: React.FC = ({ }) => {
    const [{ data, fetching }] = useGetPostFromUrl();
    console.log(data)
    if (fetching) {
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
        <React.Fragment>
            <Layout>
                <div>{data.post?.title}</div>
                {data.post?.text}
            </Layout>
        </React.Fragment>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);