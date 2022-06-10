import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { isDeliverTxFailure } from '@cosmjs/stargate'

import { createExecuteMessage } from './utils/createExecuteMessage'
import { createIncreaseAllowanceMessage } from './utils/createIncreaseAllowanceMessage'

type ExecuteRemoveLiquidityArgs = {
  tokenAmount: number
  senderAddress: string
  swapAddress: string
  lpTokenAddress: string
  client: SigningCosmWasmClient
}

export const executeRemoveLiquidity = async ({
  tokenAmount,
  swapAddress,
  senderAddress,
  lpTokenAddress,
  client,
}: ExecuteRemoveLiquidityArgs) => {
  const increaseAllowanceMessage = createIncreaseAllowanceMessage({
    tokenAmount,
    senderAddress,
    tokenAddress: lpTokenAddress,
    swapAddress,
  })

  const executeMessage = createExecuteMessage({
    senderAddress,
    swapAddress,
    message: {
      remove_liquidity: {
        amount: `${tokenAmount}`,
        min_token1: `${0}`,
        min_token2: `${0}`,
      },
    },
  })

  const result = await client.signAndBroadcast(
    senderAddress,
    [increaseAllowanceMessage, executeMessage],
    'auto'
  )

  if (isDeliverTxFailure(result)) {
    throw new Error(
      `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`
    )
  }

  return result
}
