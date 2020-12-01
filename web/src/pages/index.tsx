import { Box, Button, Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { Heading, Text, Flex } from "@chakra-ui/react";


const Index = () => {
  const [variables, setVariables] = useState({ limit: 20, cursor: null as null | string })
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <div>
        Posts failed to load
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
            <div key={post.id}>
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Heading>{post.title}</Heading>
                <Text>{`${post.textSnippet} ...`}</Text>
              </Box>
            </div>
          )
        )}
      {console.log(data.posts.hasMore)}
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