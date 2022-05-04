import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import {
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
    networkConfig,
    developmentChains,
} from '../utils/utils'
import verify from '../verify'

const deployGovernor: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { getNamedAccounts, deployments, network } = hre // seria el equivalente a lo que importo del modulo 'brownie' cuando lo hago con python
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    log(`Deploying Governor with account ${deployer}...`)

    const daoToken = await get('DaoToken')
    const timelock = await get('TimeLock')
    log(`DaoToken is at addreess ${daoToken.address}`)
    log(`TimeLock is at addreess ${timelock.address}`)

    const governor = await deploy('GovernorContract', {
        from: deployer,
        args: [
            daoToken.address,
            timelock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCENTAGE,
        ],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`Governor deployed at ${governor.address}`)
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(governor.address, [])
    }
}

export default deployGovernor
