import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import { ethers } from 'hardhat'
import { networkConfig, developmentChains } from '../helper-hardhat-config'
import verify from '../verify'

const deployBox: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre // seria el equivalente a lo que importo del modulo 'brownie' cuando lo hago con python
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    log('Deploying Box...')
    const boxDeploy = await deploy('Box', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    // este objeto es un 'box' deployment, pero que no posee la interfaz del contrato,
    // ofrece informacion acerca del contrato Box, como su nombre, su address y su ABI
    // pero no ofrece una interfaz para ejecutar sus funciones. Por eso no utilizo esta instancia mas abajo
    // sino que recurro a getContract
    log(`Box deployed at ${boxDeploy.address}`)
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(boxDeploy.address, [])
    }

    // actualmente el owner del Box es el deployer, pero yo quiero que sea el TimeLock, que es el que va a realizar las modificaciones.
    // Por supuesto, la gente por medio de la votacion hara las reformas, pero el que ejecutara la funcion del contrato sera TimeLock
    const box = await ethers.getContract('Box')

    log(`Current Box owner is ${await box.owner()}`)
    const timelock = await ethers.getContract('TimeLock')
    const transferOwnershipTx = await box.transferOwnership(timelock.address)
    await transferOwnershipTx.wait(1)

    log(`New Box owner is ${await box.owner()}`)
}

export default deployBox
