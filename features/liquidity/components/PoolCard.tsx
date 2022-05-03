import { LiquidityType } from 'hooks/usePoolLiquidity'
import { useTokenInfo } from 'hooks/useTokenInfo'
import {
  Card,
  CardContent,
  Column,
  Divider,
  dollarValueFormatter,
  dollarValueFormatterWithDecimals,
  ImageForTokenLogo,
  Inline,
  styled,
  Text,
} from 'junoblocks'
import Link from 'next/link'
import { __POOL_REWARDS_ENABLED__ } from 'util/constants'

type PoolCardProps = {
  poolId: string
  tokenASymbol: string
  tokenBSymbol: string
  totalLiquidity: LiquidityType
  myLiquidity: LiquidityType
  myStakedLiquidity: LiquidityType
  rewardsInfo?: any
}

const compactNumberFormatter = Intl.NumberFormat('en', {
  notation: 'compact',
})

const formatToCompactDollarValue = (value: number) => {
  if (value < 10000) {
    return dollarValueFormatterWithDecimals(value, {
      includeCommaSeparation: true,
    })
  }
  return compactNumberFormatter.format(value)
}

export const PoolCard = ({
  poolId,
  tokenASymbol,
  tokenBSymbol,
  totalLiquidity,
  myStakedLiquidity,
  rewardsInfo,
  myLiquidity,
}: PoolCardProps) => {
  const tokenA = useTokenInfo(tokenASymbol)
  const tokenB = useTokenInfo(tokenBSymbol)

  const hasProvidedLiquidity = Boolean(
    myLiquidity.tokenAmount || myStakedLiquidity.dollarValue
  )

  const stakedTokenBalanceDollarValue = myStakedLiquidity.dollarValue

  const providedLiquidityDollarValueFormatted = hasProvidedLiquidity
    ? formatToCompactDollarValue(
        myLiquidity.dollarValue + stakedTokenBalanceDollarValue
      )
    : 0

  const totalDollarValueLiquidityFormatted = dollarValueFormatterWithDecimals(
    totalLiquidity.dollarValue,
    {
      includeCommaSeparation: true,
    }
  )

  return (
    <Link href={`/pools/${poolId}`} passHref>
      <Card variant="secondary" active={hasProvidedLiquidity}>
        <CardContent size="medium">
          <Column align="center">
            <StyledDivForTokenLogos css={{ paddingTop: '$20' }}>
              <ImageForTokenLogo
                size="big"
                logoURI={tokenA.logoURI}
                alt={tokenA.symbol}
              />
              <ImageForTokenLogo
                size="big"
                logoURI={tokenB.logoURI}
                alt={tokenB.symbol}
              />
            </StyledDivForTokenLogos>
            <StyledTextForTokenNames
              variant="title"
              align="center"
              css={{ paddingTop: '$8' }}
            >
              {tokenA.symbol} <span /> {tokenB.symbol}
            </StyledTextForTokenNames>
          </Column>
        </CardContent>
        <Divider offsetTop="$16" offsetBottom="$12" />
        <CardContent size="medium">
          <Column gap={3}>
            <Text variant="legend" color="secondary">
              Total liquidity
            </Text>
            <Text variant="primary">
              {hasProvidedLiquidity ? (
                <>
                  <StyledSpanForHighlight>
                    ${providedLiquidityDollarValueFormatted}{' '}
                  </StyledSpanForHighlight>
                  of ${totalDollarValueLiquidityFormatted}
                </>
              ) : (
                <>${totalDollarValueLiquidityFormatted}</>
              )}
            </Text>
          </Column>
          <Inline justifyContent="space-between" css={{ padding: '$14 0' }}>
            <StyledDivForStatsColumn align="left">
              <Text
                variant="legend"
                color={hasProvidedLiquidity ? 'brand' : 'primary'}
                align="left"
              >
                Bonded
              </Text>
              <Text
                variant="primary"
                color={hasProvidedLiquidity ? 'brand' : 'primary'}
              >
                {hasProvidedLiquidity &&
                typeof stakedTokenBalanceDollarValue === 'number' ? (
                  <>
                    $
                    {dollarValueFormatterWithDecimals(
                      stakedTokenBalanceDollarValue,
                      {
                        includeCommaSeparation: true,
                      }
                    )}
                  </>
                ) : (
                  '--'
                )}
              </Text>
            </StyledDivForStatsColumn>
            {__POOL_REWARDS_ENABLED__ && (
              <StyledDivForStatsColumn align="center">
                <Text variant="legend" color="secondary" align="center">
                  Rewards
                </Text>
                <StyledDivForTokenLogos css={{ paddingTop: '0' }}>
                  <ImageForTokenLogo
                    size="medium"
                    logoURI={tokenA.logoURI}
                    alt={tokenA.symbol}
                  />
                  <ImageForTokenLogo
                    size="medium"
                    logoURI={tokenB.logoURI}
                    alt={tokenB.symbol}
                  />
                </StyledDivForTokenLogos>
              </StyledDivForStatsColumn>
            )}
            <StyledDivForStatsColumn align="right">
              <Text variant="legend" color="secondary" align="right">
                APR
              </Text>

              <Text variant="primary" align="right">
                {dollarValueFormatter(rewardsInfo?.yieldPercentageReturn ?? 0)}%
              </Text>
            </StyledDivForStatsColumn>
          </Inline>
        </CardContent>
      </Card>
    </Link>
  )
}

export const StyledDivForTokenLogos = styled('div', {
  display: 'flex',
  [`& ${ImageForTokenLogo}`]: {
    position: 'relative',
    zIndex: '$2',
    backgroundColor: '$white',
    '&:not(&:first-of-type)': {
      backgroundColor: 'transparent',
      marginLeft: '-0.25rem',
      zIndex: '$1',
    },
  },
})

const StyledTextForTokenNames: typeof Text = styled(Text, {
  paddingTop: '$3',
  paddingBottom: '$2',
  display: 'flex',
  alignItems: 'center',
  '& span': {
    width: 4,
    height: 4,
    margin: '0 $3',
    borderRadius: '50%',
    backgroundColor: '$textColors$primary',
  },
})

const StyledDivForStatsColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  flex: 0.3,
  justifyContent: 'center',
  alignItems: 'center',
  rowGap: '$space$3',
  variants: {
    align: {
      left: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      },
      center: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      right: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      },
    },
  },
})

const StyledSpanForHighlight = styled('span', {
  display: 'inline',
  color: '$textColors$brand',
})
