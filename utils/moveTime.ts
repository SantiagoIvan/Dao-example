import { network } from 'hardhat'

export const moveTime = async (amount: number) => {
    console.log(`Moving ${amount} seconds...`)
    await network.provider.send('evm_increaseTime', [amount])
    console.log(`Moved forward ${amount} seconds`)
}
