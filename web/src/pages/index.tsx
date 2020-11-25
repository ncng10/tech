import { withUrqlClient } from "next-urql";
import React from "react";
import { NavBar } from "../components/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => (
  <React.Fragment>
    <NavBar />
  </React.Fragment>
)

export default withUrqlClient(createUrqlClient)(Index)