import { useTokenInfoByPoolId } from 'hooks/useTokenInfo'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { getStakedBalance } from 'services/staking'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from 'util/constants'

export const useStakedTokenBalance = ({ poolId, enabled = true }) => {
  const { address, status, client } = useRecoilValue(walletState)

  const token = useTokenInfoByPoolId(poolId)

  const { data = 0, isLoading } = useQuery<number>(
    `stakedTokenBalance/${poolId}/${address}`,
    async () => {
      return Number(
        await getStakedBalance(address, token.staking_address, client)
      )
    },
    {
      enabled: Boolean(
        token?.staking_address &&
          status === WalletStatusType.connected &&
          enabled
      ),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    }
  )

  return [data, isLoading] as const
}
