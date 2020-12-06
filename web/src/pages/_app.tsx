import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { ThemeProvider } from '@chakra-ui/react'
import React from 'react'
import theme from '../theme'


function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
