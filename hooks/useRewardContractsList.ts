import { useQuery } from 'react-query'
import { TokenInfo } from './useTokenList'

type RewardsContractInfo = {
  token_address: string
  swap_address: string
  rewards_tokens: Array<
    Pick<
      TokenInfo,
      | 'logoURI'
      | 'native'
      | 'denom'
      | 'decimals'
      | 'token_address'
      | 'swap_address'
      | 'symbol'
      | 'name'
    > & {
      rewards_address: string
    }
  >
}

type RewardsInfoList = {
  name: string
  list: Array<RewardsContractInfo>
}

export const useRewardContractsList = () => {
  const { data, isLoading } = useQuery<RewardsInfoList>(
    '@rewards-list',
    async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_REWARDS_LIST_URL)
      return await response.json()
    },
    {
      onError(e) {
        console.error('Error loading rewards contracts list:', e)
      },
      refetchOnMount: false,
      refetchIntervalInBackground: true,
      refetchInterval: 1000 * 60,
    }
  )

  return [data?.list, isLoading] as const
}
