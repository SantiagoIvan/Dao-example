import { assert, expect } from 'chai'
import '@nomiclabs/hardhat-ethers'
import { deployments, ethers, network } from 'hardhat'
import {
    GovernorContract,
    DaoToken,
    TimeLock,
    Box,
} from '../../typechain-types'
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers'
import { BigNumber, Contract } from 'ethers'
import {
    ADDRESS_ZERO,
    developmentChains,
    FUNCTION_TO_CALL,
    MIN_DELAY,
    PROPOSAL_DESCRIPTION,
    QUORUM_PERCENTAGE,
    VALUE_TO_STORE,
    VOTING_DELAY,
    VOTING_PERIOD,
} from '../../utils/utils'
import { propose } from '../../scripts/01-propose'
import setUp from '../../deploy/04-setup-governance'
import { moveBlocks } from '../../utils/moveBlocks'
import { vote } from '../../scripts/02-vote'

describe('Proposal votation', function () {
    let daoToken: DaoToken | Contract
    let timelock: TimeLock | Contract
    let box: Box | Contract
    let governor: GovernorContract | Contract
    let deployer: SignerWithAddress
    let addr1: SignerWithAddress
    let addr2: SignerWithAddress
    let tokenToTransfer: BigNumber

    const voteType = 1 // a favor
    const reason = 'A random reason to vote'

    beforeEach(async function () {
        const addresses = await ethers.getSigners()
        deployer = addresses[0]
        addr1 = addresses[1]
        addr2 = addresses[2]

        const daoTokenContract = await ethers.getContractFactory(
            'DaoToken',
            deployer
        )
        const timelockContract = await ethers.getContractFactory(
            'TimeLock',
            deployer
        )
        const governorContract = await ethers.getContractFactory(
            'GovernorContract',
            deployer
        )
        const boxContract = await ethers.getContractFactory('Box', deployer)

        daoToken = await daoTokenContract.deploy()
        timelock = await timelockContract.deploy(MIN_DELAY, [], [])
        governor = await governorContract.deploy(
            daoToken.address,
            timelock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCENTAGE
        )
        box = await boxContract.deploy()
        await daoToken.deployed()
        await timelock.deployed()
        await governor.deployed()
        await box.deployed()

        // Set up
        const proposerRole = await timelock.PROPOSER_ROLE()
        const executorRole = await timelock.EXECUTOR_ROLE()
        const adminRole = await timelock.TIMELOCK_ADMIN_ROLE()

        const proposerTx = await timelock.grantRole(
            proposerRole,
            governor.address
        )
        await proposerTx.wait(1)
        const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO)
        await executorTx.wait(1)
        const adminTx = await timelock.revokeRole(adminRole, deployer.address)
        await adminTx.wait(1)

        const transferOwnershipTx = await box.transferOwnership(
            timelock.address
        )
        await transferOwnershipTx.wait(1)

        // Le transfiero Ether a otras cuentas para que tambien puedan votar
        tokenToTransfer = ethers.BigNumber.from('100')
        await daoToken.approve(addr1.address, tokenToTransfer)
        await daoToken.approve(addr2.address, tokenToTransfer)
        await daoToken.transfer(addr1.address, tokenToTransfer)
        await daoToken.transfer(addr2.address, tokenToTransfer)
    })

    it('Deployer makes a proposal successfully, and wins the votation', async function () {
        //  ************ PROPUESTA ************
        const encodedFunctionCall = box.interface.encodeFunctionData(
            FUNCTION_TO_CALL,
            [VALUE_TO_STORE]
        )
        const proposeTx = await governor.propose(
            [box.address],
            [0],
            [encodedFunctionCall],
            PROPOSAL_DESCRIPTION
        )
        const receipt = await proposeTx.wait(1)
        const proposalId = receipt.events[0].args.proposalId
        let proposalState = await governor.state(proposalId)
        expect(proposalState).to.equal(0) // estado pendiente

        //  ************ AVANZO X BLOQUES ************
        if (developmentChains.includes(network.name)) {
            moveBlocks(VOTING_DELAY + 1)
        }
        proposalState = await governor.state(proposalId)
        expect(proposalState).to.equal(1) // estado activa

        //  ************ VOTACION ************
        // Votacion:
        // 0: En contra
        // 1: A favor
        // 2: me chupa un huevo

        // el deployer
        let voteTx = await governor.castVoteWithReason(proposalId, 0, reason)
        voteTx.wait(1)
        expect(await governor.hasVoted(proposalId, deployer.address)).to.true
        //  ************ AVANZO X BLOQUES ************
        if (developmentChains.includes(network.name)) {
            moveBlocks(VOTING_PERIOD + 100)
        }
        proposalState = await governor.state(proposalId)
        expect(proposalState).to.equal(4) // estado activa
    })
})
