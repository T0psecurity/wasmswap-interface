import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { getSwapInfo, InfoResponse } from '../services/swap'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from '../util/constants'
import { useChainInfo } from './useChainInfo'
import { useMultipleTokenInfo, useTokenInfoByPoolIds } from './useTokenInfo'

export type SwapInfo = Pick<
  InfoResponse,
  'token1_denom' | 'token2_denom' | 'lp_token_address'
> & {
  swap_address: string
  lp_token_supply: number
  token1_reserve: number
  token2_reserve: number
}

type UseMultipleSwapInfoArgs = {
  tokenSymbols?: Array<string>
  poolIds?: Array<string>
  refetchInBackground?: boolean
}

export const useMultipleSwapInfo = ({
  tokenSymbols,
  poolIds,
  refetchInBackground,
}: UseMultipleSwapInfoArgs) => {
  const [chainInfo] = useChainInfo()

  const tokensByPoolIds = useTokenInfoByPoolIds(poolIds)
  const tokensByTokenSymbols = useMultipleTokenInfo(tokenSymbols)

  const { data = [], isLoading } = useQuery<Array<SwapInfo>>(
    `swapInfo/${(tokenSymbols || poolIds)?.join('+')}`,
    async () => {
      const tokens = tokensByPoolIds || tokensByTokenSymbols

      const swaps: Array<{ swap: InfoResponse; swap_address: string }> =
        await Promise.all(
          tokens.map(async ({ swap_address }) => {
            return {
              swap: await getSwapInfo(swap_address, chainInfo.rpc),
              swap_address,
            }
          })
        )

      return swaps.map(({ swap, swap_address }) => ({
        ...swap,
        swap_address,
        token1_reserve: Number(swap.token1_reserve),
        token2_reserve: Number(swap.token2_reserve),
        lp_token_supply: Number(swap.lp_token_supply),
      }))
    },
    {
      enabled: Boolean(
        (tokenSymbols?.length || poolIds?.length) && chainInfo?.rpc
      ),
      refetchOnMount: 'always',
      refetchInterval: refetchInBackground
        ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL
        : undefined,
      refetchIntervalInBackground: refetchInBackground,
    }
  )

  return [data, isLoading] as const
}

export const useSwapInfo = ({
  refetchInBackground = true,
  tokenSymbol,
  poolId,
}: {
  tokenSymbol?: string
  poolId?: string
  refetchInBackground?: boolean
}) => {
  return useMultipleSwapInfo(
    useMemo(
      () => ({
        tokenSymbols: tokenSymbol ? [tokenSymbol] : undefined,
        poolIds: poolId ? [poolId] : undefined,
        refetchInBackground,
      }),
      [tokenSymbol, poolId, refetchInBackground]
    )
  )?.[0]
}
