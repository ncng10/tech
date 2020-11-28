import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10
    }
  });
  return (
    <React.Fragment>
      <NextLink href="/create-post">
        <Link>
          Create a Post
      </Link>
      </NextLink>
      {!data ? (
        <div>Loading...</div>) : (
          data.posts.map(post =>
            <div key={post.id}>
              {post.title}
            </div>
          )
        )}
    </React.Fragment >
  )
}


export default withUrqlClient(createUrqlClient, { ssr: true })(Index)