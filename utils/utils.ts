import { ethers } from 'hardhat'

export const MIN_DELAY = 3600
export const VOTING_DELAY = 1 // 1 blocks
export const VOTING_PERIOD = 5 // 5 block
export const QUORUM_PERCENTAGE = 4
export const ADDRESS_ZERO = ethers.constants.AddressZero
export const developmentChains = ['hardhat', 'localhost']
export const VALUE_TO_STORE = 69
export const FUNCTION_TO_CALL = 'store'
export const PROPOSAL_DESCRIPTION = 'Some falopa description for the proposal'

export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    // Default one is ETH/USD contract on Kovan
    kovan: {
        blockConfirmations: 6,
    },
}
