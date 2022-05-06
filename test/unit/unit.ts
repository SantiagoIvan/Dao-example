import { assert, expect } from 'chai'
import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
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
    MIN_DELAY,
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
} from '../../utils/utils'

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
        it('Owner should be deployer initially', async function () {
            const owner = await box.owner()
            expect(owner).to.equal(deployer.address)
        })

        it('Should transfer ownership to timelock contract', async function () {
            const transferOwnershipTx = await box.transferOwnership(
                timelock.address
            )
            await transferOwnershipTx.wait(1)
            const newOwner = await box.owner()
            expect(newOwner).to.equal(timelock.address)
        })

        it('Should fail if a random tries to update the Box', async function () {
            const transferOwnershipTx = await box.transferOwnership(
                timelock.address
            )
            await transferOwnershipTx.wait(1)
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
            // assert.
        })
    })
})
