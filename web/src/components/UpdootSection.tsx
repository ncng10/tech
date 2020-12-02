import { Button } from '@chakra-ui/react';
import React from 'react'
import { PostsQuery, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostsQuery['posts']['posts'][0]
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [, vote] = useVoteMutation();
    return (
        <React.Fragment>
            <Button
                onClick={() => {
                    vote({
                        postId: post.id,
                        value: 1,
                    })
                }}
                w={10} h={10} mr={5}>Like</Button>
            {post.points}
            <Button
                onClick={() => {
                    vote({
                        postId: post.id,
                        value: -1,
                    })
                }}
                w={50} h={10}>Dislike</Button>
        </React.Fragment>
    );
}