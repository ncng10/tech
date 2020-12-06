import { ApolloCache } from '@apollo/client';
import { Button } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React from 'react'
import { PostsQuery, useVoteMutation, VoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostsQuery['posts']['posts'][0]
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
    const data = cache.readFragment<{
        id: number;
        points: number;
        voteStatus: number | null;
    }>({
        id: "Post:" + postId,
        fragment: gql`
        fragment _ on Post {
            id
            points
            voteStatus
        }
        `
    });
    if (data) {
        if (data.voteStatus === value) {
            return;
        }
        const newPoints =
            (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
        cache.writeFragment({
            id: "Post:" + postId,
            fragment: gql`
                fragment __ on Post {
                    points
                    voteStatus
                }
            `,
            data: { points: newPoints, voteStatus: value },
        });
    }
}


export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [vote] = useVoteMutation();
    return (
        <React.Fragment>
            <Button
                onClick={async () => {
                    if (post.voteStatus === 1) {
                        return;
                    }
                    await vote({
                        variables: {
                            postId: post.id,
                            value: 1,
                        },
                        update: (cache) => updateAfterVote(1, post.id, cache),
                    })
                }}
                w={10} h={10} mr={5}>Like</Button>
            { post.points}
            <Button
                onClick={async () => {
                    if (post.voteStatus === -1) {
                        return;
                    }
                    await vote({
                        variables: {
                            postId: post.id,
                            value: -1,
                        },
                        update: (cache) => updateAfterVote(-1, post.id, cache),
                    });
                }}
                w={50} h={10}>Dislike</Button>
        </React.Fragment >
    );
}