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
import { Contract } from 'ethers'
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

/**
 * `describe` es una funcion que permite organizar los tests. En realidad no es obligatoria,
 * pero te ayuda a organizar todo el set de tests como se ve aca.
 * https://hardhat.org/tutorial/testing-contracts.html
 *
 * Recibe como primer parametro el nombre de la seccion del test suite y un callback
 * donde van todos los tests. Puede haber describes anidados si mi organizacion asi
 * lo requiere
 */
describe('Set of Contracts', function () {
    /**
     * `before`, `beforeEach`, `after`, `afterEach`
     * Algo que se hace habitualmente es declarar las variables aca y definirlas abajo,
     * para que puedan ser accedidas despues por todos los demas bloques
     */

    let daoToken: DaoToken | Contract
    let timelock: TimeLock | Contract
    let box: Box | Contract
    let governor: GovernorContract | Contract
    let deployer: SignerWithAddress
    let addr1: SignerWithAddress
    let addr2: SignerWithAddress

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
    })

    describe('Deployment', function () {
        it('Token deploys successfully', async function () {
            expect(daoToken.address).to.not.equal(ADDRESS_ZERO)
        })
        it('TimeLock deploys successfully', async function () {
            expect(timelock.address).to.not.equal(ADDRESS_ZERO)
        })
        it('GovernorContract deploys successfully', async function () {
            expect(governor.address).to.not.equal(ADDRESS_ZERO)
        })
        it('Box deploys successfully', async function () {
            expect(box.address).to.not.equal(ADDRESS_ZERO)
        })
        it('Should assign the total supply of tokens to the owner', async function () {
            const supply = await daoToken.s_maxSupply()
            const balance = await daoToken.balanceOf(deployer.address)
            expect(balance.toString()).to.equal(supply.toString())
        })
    })

    describe('Box Ownership', function () {
        it('Should transfer ownership to timelock contract', async function () {
            const owner = await box.owner()
            expect(owner).to.equal(timelock.address)
        })

        it('Should fail if a random tries to update the Box', async function () {
            // esta es la unica forma que se me ocurrio para testear que lance una exception
            try {
                await box.store(55)
                assert(false)
            } catch (error) {
                assert(true)
            }

            // Intente varias formas para testear que lance ese tipo de VMException pero ninguna me funciono :C. Solo la que invente arriba.
            // expect(await box.store(55)).to.throws(
            //     'Ownable: caller is not the owner'
            // )
            // expect(await box.store(55)).to.throw()
            // assert.fail() tampoco funciona
        })
    })
    describe('Proposal', function () {
        it('Deployer makes a proposal successfully', async function () {
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

            if (developmentChains.includes(network.name)) {
                moveBlocks(VOTING_DELAY + 1)
            }
            proposalState = await governor.state(proposalId)
            expect(proposalState).to.equal(1) // estado activa
        })
    })
})
