import '@nomiclabs/hardhat-ethers'
import { ethers, network } from 'hardhat'
import { moveBlocks } from '../utils/moveBlocks'
import { developmentChains, proposalsPath, VOTING_PERIOD } from '../utils/utils'
import fs from 'fs'

const vote = async (proposalIndex: number) => {
    const proposals = JSON.parse(fs.readFileSync(proposalsPath, 'utf8'))
    const proposalId = proposals[network.name][proposalIndex]
    console.log('asd')
    /**
     * Votacion:
     * 0: En contra
     * 1: A favor
     * 2: me chupa un huevo
     *
     * En el contrato de Governor, hay varias funciones para votar: castVote, castVoteWithReason, entre otras.
     * Hay otra muy interesante que es la de castVoteBySig, que te permite 'subsidiar' por asi decirlo los gastos de gas de votacion
     * Se firma un voto con la wallet del usuario, gratis por parte del usuario, y luego la DAO ejecuta todas las transacciones y juntas y paga el gas
     * Mas info en: https://soliditydeveloper.com/meta-transactions
     *
     * Consulto el estado de la propuesta antes y despues para ver el cambio. Todos los estados disponibles se encuentran en:
     * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/IGovernor.sol
     */
    const governor = await ethers.getContract('GovernorContract')
    let state = await governor.state(proposalId)
    console.log('Proposal state before: ', state) // Active es 1
    if (state !== 1) {
        throw new Error('Proposal is not active')
    }

    const voteType = 1
    const voteTx = await governor.castVoteWithReason(
        proposalId,
        voteType,
        'i like that proposal'
    )
    await voteTx.wait(1)

    // nos movemos al final del periodo de votacion, para ver los resultados
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
    console.log('Voted!')

    state = await governor.state(proposalId)
    console.log('Proposal state after: ', state) // Succeeded es 4
}

vote(0)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log('Network: ', network.name)
        console.log('An error has been encountered', { error })
        process.exit(1)
    })
