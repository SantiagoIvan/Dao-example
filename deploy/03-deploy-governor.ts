import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import { QUORUM_PERCENTAGE, VOTING_DELAY, VOTING_PERIOD} from '../helper-hardhat-config'
import {ethers} from 'hardhat'
import { getContractFactory } from 'hardhat-deploy-ethers/types'

const deployGovernor: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre // seria el equivalente a lo que importo del modulo 'brownie' cuando lo hago con python
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    log(`Deploying Governor with account ${deployer}...`)

    const daoToken = await get("DaoToken")
    const timelock = await get("TimeLock")
    log(`DaoToken is at addreess ${daoToken.address}`)
    log(`TimeLock is at addreess ${timelock.address}`)

    const governor = await deploy("GovernorContract", {
        from: deployer,
        args: [daoToken.address, timelock.address, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE],
        log: true
    })
    log(`Governor deployed at ${governor.address}`)
}

export default deployGovernor