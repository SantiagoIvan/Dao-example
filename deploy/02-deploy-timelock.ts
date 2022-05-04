import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import { networkConfig, developmentChains, MIN_DELAY } from '../utils/utils'
import verify from '../verify'

const deployTimelock: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { getNamedAccounts, deployments, network } = hre // seria el equivalente a lo que importo del modulo 'brownie' cuando lo hago con python
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log(`Deploying Timelock with account ${deployer}...`)

    const timelock = await deploy('TimeLock', {
        from: deployer,
        args: [MIN_DELAY, [], []], // Me fijo los parametros en el contrato
        /**
         * Proposers: el govierno puede realizar propuestas al timelock
         * Executors: Cualquiera puede ejecutar las propuestas ya aceptadas
         * El gobierno realiza una propuesta al timeLock. Una vez que la recibe el timelock,
         * y pasa ese min_delay, ya puede ser ejecutada
         * Se puede hacer una integracion con chainlink Keeper para automaticamente ejecutar las propuestas
         */
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`Deployed Timelock to address ${timelock.address}\n`)
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(timelock.address, [])
    }
}

export default deployTimelock
