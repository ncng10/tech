import { Box, Button, Link } from "@chakra-ui/react";
import React from "react";
import { useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
import NextLink from 'next/link'
import { Heading, Text, Flex } from "@chakra-ui/react";
import { UpdootSection } from "../components/UpdootSection"
import { withApollo } from "../utils/withApollo";
import { NavBar } from "../components/NavBar";

const Index = () => {
  const [deletePost] = useDeletePostMutation();
  const { data: meData, } = useMeQuery();
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 5, cursor: null as null | string },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return (
      <div>
        {error?.message}
      </div>
    )
  }
  return (
    <React.Fragment>
      <NavBar />
      <NextLink href="/create-post">
        <Link>
          Create a Post
      </Link>
      </NextLink>
      {!data && loading ? (
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
                        deletePost({
                          variables: { id: post.id }, update: (cache) => {
                            cache.evict({ id: "Post:" + post.id });
                          }
                        });
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
            <Button onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }} isLoading={loading} my={8}>Load More</Button>
          </Flex>) : null
      }

    </React.Fragment >
  )
}


export default withApollo({ ssr: true })(Index);