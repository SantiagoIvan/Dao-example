// esta funcion existe para 'adelantar el tiempo' cuando estoy trabajando en una red local o hardhat
import { network } from 'hardhat'

export const moveBlocks = async (amount: Number) => {
    console.log(`Moving ${amount} blocks...`)
    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: 'evm_mine', // equivalente a minar un bloque en local.
            params: [],
        })
    }
}
