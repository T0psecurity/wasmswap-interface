import {
  MsgExecuteContractEncodeObject,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import { coin, isDeliverTxFailure, StdFee } from '@cosmjs/stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

import { unsafelyGetDefaultExecuteFee } from '../../util/fees'

export type SwapToken1ForToken2Input = {
  nativeAmount: number
  price: number
  slippage: number
  senderAddress: string
  swapAddress: string
  tokenDenom: string
  client: SigningCosmWasmClient
}

export const swapToken1ForToken2 = async (input: SwapToken1ForToken2Input) => {
  const minToken = Math.floor(input.price * (1 - input.slippage))
  const msg = {
    swap: {
      input_token: 'Token1',
      input_amount: `${input.nativeAmount}`,
      min_output: `${minToken}`,
    },
  }
  return await input.client.execute(
    input.senderAddress,
    input.swapAddress,
    msg,
    unsafelyGetDefaultExecuteFee(),
    undefined,
    [coin(input.nativeAmount, input.tokenDenom)]
  )
}

export type SwapToken2ForToken1Input = {
  tokenAmount: number
  price: number
  slippage: number
  senderAddress: string
  swapAddress: string
  tokenAddress: string
  tokenDenom: string
  token2_native: boolean
  client: SigningCosmWasmClient
}

export const swapToken2ForToken1 = async (
  input: SwapToken2ForToken1Input
): Promise<any> => {
  const minNative = Math.floor(input.price * (1 - input.slippage))
  const defaultExecuteFee = unsafelyGetDefaultExecuteFee()

  let swap_msg = {
    swap: {
      input_token: 'Token2',
      input_amount: `${input.tokenAmount}`,
      min_output: `${minNative}`,
    },
  }

  if (!input.token2_native) {
    let msg1 = {
      increase_allowance: {
        amount: `${input.tokenAmount}`,
        spender: `${input.swapAddress}`,
      },
    }
    const executeContractMsg1: MsgExecuteContractEncodeObject = {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: input.senderAddress,
        contract: input.tokenAddress,
        msg: toUtf8(JSON.stringify(msg1)),
        funds: [],
      }),
    }

    const executeContractMsg2: MsgExecuteContractEncodeObject = {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: input.senderAddress,
        contract: input.swapAddress,
        msg: toUtf8(JSON.stringify(swap_msg)),
        funds: [],
      }),
    }
    const fee: StdFee = {
      amount: defaultExecuteFee.amount,
      gas: (Number(defaultExecuteFee.gas) * 1.2).toString(),
    }
    let result = await input.client.signAndBroadcast(
      input.senderAddress,
      [executeContractMsg1, executeContractMsg2],
      fee
    )
    if (isDeliverTxFailure(result)) {
      throw new Error(
        `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`
      )
    }
    return result
  } else {
    return await input.client.execute(
      input.senderAddress,
      input.swapAddress,
      swap_msg,
      defaultExecuteFee,
      undefined,
      [{ amount: input.tokenAmount.toString(), denom: input.tokenDenom }]
    )
  }
}

export interface SwapTokenForTokenInput {
  tokenAmount: number
  price: number
  slippage: number
  senderAddress: string
  swapAddress: string
  outputSwapAddress: string
  tokenAddress: string
  tokenDenom: string
  tokenNative: boolean
  client: SigningCosmWasmClient
}

export const swapTokenForToken = async (
  input: SwapTokenForTokenInput
): Promise<any> => {
  const minOutputToken = Math.floor(input.price * (1 - input.slippage))
  const defaultExecuteFee = unsafelyGetDefaultExecuteFee()

  const swapMsg = {
    pass_through_swap: {
      output_min_token: `${minOutputToken}`,
      input_token: 'Token2',
      input_token_amount: `${input.tokenAmount}`,
      output_amm_address: input.outputSwapAddress,
    },
  }
  if (!input.tokenNative) {
    const msg1 = {
      increase_allowance: {
        amount: `${input.tokenAmount}`,
        spender: `${input.swapAddress}`,
      },
    }
    const executeContractMsg1: MsgExecuteContractEncodeObject = {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: input.senderAddress,
        contract: input.tokenAddress,
        msg: toUtf8(JSON.stringify(msg1)),
        funds: [],
      }),
    }

    const executeContractMsg2: MsgExecuteContractEncodeObject = {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: input.senderAddress,
        contract: input.swapAddress,
        msg: toUtf8(JSON.stringify(swapMsg)),
        funds: [],
      }),
    }
    const fee: StdFee = {
      amount: defaultExecuteFee.amount,
      gas: (+defaultExecuteFee.gas * 2).toString(),
    }
    let result = await input.client.signAndBroadcast(
      input.senderAddress,
      [executeContractMsg1, executeContractMsg2],
      fee
    )
    if (isDeliverTxFailure(result)) {
      throw new Error(
        `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`
      )
    }
    return result
  }
  return await input.client.execute(
    input.senderAddress,
    input.swapAddress,
    swapMsg,
    {
      amount: defaultExecuteFee.amount,
      gas: (+defaultExecuteFee.gas * 2).toString(),
    },
    undefined,
    [{ amount: input.tokenAmount.toString(), denom: input.tokenDenom }]
  )
}