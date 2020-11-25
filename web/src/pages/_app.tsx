import { ChakraProvider, ColorModeProvider, ThemeProvider } from '@chakra-ui/react'
import React from 'react'
import { Provider, createClient } from "urql";
import theme from '../theme'

const client = createClient({
  url: "http://localhost:5001/graphql",
  fetchOptions: {
    credentials: "include",
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp
