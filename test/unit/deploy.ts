import { expect } from 'chai'
import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
import {
    GovernorContract,
    DaoToken,
    TimeLock,
    Box,
} from '../../typechain-types'
import { assert } from 'console'
import exp from 'constants'

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

    let daoToken: DaoToken
    let timelock: TimeLock
    let box: Box
    let governor: GovernorContract
    let deployer: string

    const voteType = 1 // a favor
    const reason = 'A random reason to vote'

    beforeEach(async function () {
        // const daoTokenContract = await ethers.getContractFactory("DaoToken")
        daoToken = await ethers.getContract('DaoToken')
    })

    describe('Deployment', function () {
        it('Token deploys successfully', async function () {
            expect(1).to.equal(2)
        })

        it('Should assign the total supply of tokens to the owner', async function () {})
    })

    describe('Transactions', function () {
        it('Should transfer tokens between accounts', async function () {})

        it('Should fail if sender doesn’t have enough tokens', async function () {})

        it('Should update balances after transfers', async function () {})
    })
})
