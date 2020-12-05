import { Box, Button, Icon, Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { Heading, Text, Flex } from "@chakra-ui/react";
import { UpdootSection } from "../components/UpdootSection"

const Index = () => {
  const [variables, setVariables] = useState({ limit: 20, cursor: null as null | string });
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData, }] = useMeQuery();
  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <div>
        {error?.message}
      </div>
    )
  }
  return (
    <React.Fragment>
      <NextLink href="/create-post">
        <Link>
          Create a Post
      </Link>
      </NextLink>
      {!data && fetching ? (
        <div>Loading...</div>) : (
          data.posts.posts.map((post) =>
            !post ? null : (
              <div key={post.id}>
                <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                  <UpdootSection post={post} />
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Heading style={{ cursor: "pointer" }}>{post.title}</Heading>
                  </NextLink>
               Posted by: {post.creator.username}
                  <Text>{`${post.textSnippet}...`}</Text>
                </Box>
                {post.creator.id === meData?.me?.id ?
                  <div>
                    <NextLink href="/post/update/[id]"
                      as={`/post/update/${post.id}`}
                    >
                      <Button>
                        Update Post
                      </Button>
                    </NextLink>
                    <Button
                      onClick={() => {
                        deletePost({ id: post.id })
                      }}
                    >Delete Post</Button>
                  </div>
                  : null
                }
              </div>
            ))
        )}
      {
        data && data.posts.hasMore
          ? (<Flex>
            <Button onClick={() => setVariables({
              limit: variables?.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
            })} isLoading={fetching} my={8}>Load More</Button>
          </Flex>) : null
      }

    </React.Fragment >
  )
}


export default withUrqlClient(createUrqlClient, { ssr: true })(Index)