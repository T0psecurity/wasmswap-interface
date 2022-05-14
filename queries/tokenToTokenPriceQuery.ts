import {
  getToken1ForToken2Price,
  getToken2ForToken1Price,
  getTokenForTokenPrice,
} from '../services/swap'
import {
  convertDenomToMicroDenom,
  convertMicroDenomToDenom,
} from '../util/conversion'

export async function tokenToTokenPriceQuery({
  baseToken,
  fromTokenInfo,
  toTokenInfo,
  amount,
  chainInfo,
}): Promise<number | undefined> {
  const formatPrice = (price) =>
    convertMicroDenomToDenom(price, toTokenInfo.decimals)

  const convertedTokenAmount = convertDenomToMicroDenom(
    amount,
    fromTokenInfo.decimals
  )

  if (fromTokenInfo.symbol === toTokenInfo.symbol) {
    return 1
  }

  const shouldQueryBaseTokenForTokenB =
    fromTokenInfo.symbol === baseToken.symbol && toTokenInfo.swap_address

  const shouldQueryTokenBForBaseToken =
    toTokenInfo.symbol === baseToken.symbol && fromTokenInfo.swap_address

  if (shouldQueryBaseTokenForTokenB) {
    const resp = await getToken1ForToken2Price({
      nativeAmount: convertedTokenAmount,
      swapAddress: toTokenInfo.swap_address,
      rpcEndpoint: chainInfo.rpc,
    })

    return formatPrice(resp)
  } else if (shouldQueryTokenBForBaseToken) {
    return formatPrice(
      await getToken2ForToken1Price({
        tokenAmount: convertedTokenAmount,
        swapAddress: fromTokenInfo.swap_address,
        rpcEndpoint: chainInfo.rpc,
      })
    )
  }

  return formatPrice(
    await getTokenForTokenPrice({
      tokenAmount: convertedTokenAmount,
      swapAddress: fromTokenInfo.swap_address,
      outputSwapAddress: toTokenInfo.swap_address,
      rpcEndpoint: chainInfo.rpc,
    })
  )
}
