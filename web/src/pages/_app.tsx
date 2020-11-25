import { ChakraProvider, ColorModeProvider, ThemeProvider } from '@chakra-ui/react'
import React from 'react'

import theme from '../theme'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  )
}

export default MyApp
