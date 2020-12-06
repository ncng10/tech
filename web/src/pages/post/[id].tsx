import React from 'react'
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';

const Post: React.FC = ({ }) => {
    const { data, loading } = useGetPostFromUrl();
    console.log(data)
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
        <React.Fragment>
            <Layout>
                <div>{data.post?.title}</div>
                {data.post?.text}
            </Layout>
        </React.Fragment>
    );
}

export default withApollo({ ssr: true })(Post);