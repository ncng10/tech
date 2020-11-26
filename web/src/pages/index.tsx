import { withUrqlClient } from "next-urql";
import React from "react";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <React.Fragment>
      <NavBar />
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