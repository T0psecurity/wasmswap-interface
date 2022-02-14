import 'normalize.css'
import 'styles/globals.scss'
import 'focus-visible'

import type { AppProps } from 'next/app'
import { RecoilRoot } from 'recoil'
import { ErrorBoundary } from 'components/ErrorBoundary'
import { QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { TestnetDialog } from 'components/TestnetDialog'
import { queryClient } from 'services/queryClient'
import { __TEST_MODE__ } from '../util/constants'
import {
  styled,
  useThemeClassName,
  useSubscribeDefaultAppTheme,
  globalCss,
} from '../components/theme'
import { useEffect } from 'react'

const applyGlobalStyles = globalCss({
  body: {
    backgroundColor: '$backgroundColors$base',
  },
})

function NextJsAppRoot({ children }) {
  const themeClassName = useThemeClassName()

  useSubscribeDefaultAppTheme()

  /* apply theme class on body also */
  useEffect(() => {
    document.body.classList.add(themeClassName)
    applyGlobalStyles()
    return () => {
      document.body.classList.remove(themeClassName)
    }
  }, [themeClassName])

  return (
    <StyledContentWrapper
      data-app-wrapper=""
      lang="en-US"
      className={typeof window === 'undefined' ? null : themeClassName}
      suppressHydrationWarning
    >
      {typeof window === 'undefined' ? null : children}
    </StyledContentWrapper>
  )
}

const StyledContentWrapper = styled('div', {
  backgroundColor: '$backgroundColors$base',
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <NextJsAppRoot>
          <ErrorBoundary>
            <Component {...pageProps} />
            {__TEST_MODE__ && <TestnetDialog />}
            <Toaster position="top-right" toastOptions={{ duration: 10000 }} />
          </ErrorBoundary>
        </NextJsAppRoot>
      </QueryClientProvider>
    </RecoilRoot>
  )
}

export default MyApp
