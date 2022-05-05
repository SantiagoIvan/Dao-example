import '@nomiclabs/hardhat-ethers'
import { ethers, network } from 'hardhat'
import {
    developmentChains,
    FUNCTION_TO_CALL,
    VALUE_TO_STORE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
} from '../utils/utils'
import fs from 'fs'
import { moveTime } from '../utils/moveTime'
import { moveBlocks } from '../utils/moveBlocks'

// la funcion de queue se encuentra en el contrato IGovernorTimelock
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/extensions/GovernorTimelockControl.sol
// la firma de la funcion es la misma que proposal, la unica diferencia es el hash description
const queueAndExecute = async (func: string, val: number) => {
    const box = await ethers.getContract('Box')
    const governor = await ethers.getContract('GovernorContract')
    const encodedFunctionCall = box.interface.encodeFunctionData(func, [val])

    const descriptionHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
    )
    /**
     * Por que hago este descriptionHash si yo no le mande el hash nunca?
     * Porque la descripcion se hashea en la blockchain, y cuando vaya a buscar la propuesta a la cola, la descripcion va a estar hasheada
     */
    console.log('Queuing...')
    const queueTx = await governor.queue(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await queueTx.wait(1)
    console.log('Queued!')
    /**
     * Una vez que pongo en la queue la propuesta, no puedo ejecutarla hasta que pase ese min_delay
     * Ahora queda esperar, que por supuesto si estamos en local no voy a esperar un carajo sino que voy a minar los bloques
     */
    if (developmentChains.includes(network.name)) {
        // https://ethereum.stackexchange.com/questions/27447/evm-increasetime-does-not-increase-timestamp
        // avanzo en el tiempo y mino un bloque, cosa que el timestamps del ultimo bloque (que ahora sera el bloque minado) tenga el timestamp anterior + delay
        // y evitar comportamiento erratico al consultar el tiempo transcurrido
        // Si no hago eso, al consultar el tiempo, me devolvera el valor del ultimo bloque minado
        // getting timestamp
        const blockNumBefore = await ethers.provider.getBlockNumber()
        const blockBefore = await ethers.provider.getBlock(blockNumBefore)
        const timestampBefore = blockBefore.timestamp
        console.log('TIMESTAMP BEFORE', timestampBefore)
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)
        const blockNumAfter = await ethers.provider.getBlockNumber()
        const blockAfter = await ethers.provider.getBlock(blockNumAfter)
        const timestampAfter = blockAfter.timestamp
        console.log('TIMESTAMP after', timestampAfter)
    }

    console.log('Executing proposal...')

    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)
    console.log('Executed! Check the new value in the box')

    const value = await box.retrieve()
    console.log('New value is', value.toString())
}

queueAndExecute(FUNCTION_TO_CALL, VALUE_TO_STORE)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log('Error encountered in QueueAndExecute', { error })
        process.exit(1)
    })
