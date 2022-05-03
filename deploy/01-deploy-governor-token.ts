import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import { ethers } from 'hardhat'

const deployGovernanceToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre // seria el equivalente a lo que importo del modulo 'brownie' cuando lo hago con python
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log(`Deploying Dao Token with account ${deployer}...`)

    const daoToken = await deploy("DaoToken", {
        from: deployer,
        args: [], // no hace falta si no recibe parametros, pero lo pongo para no olvidarme que existe esa property
        log: true,
        // waitConfirmation para cuando se deploya a una red, sea la mainnet o testnet
        // waitConfirmations: networkConfig[network.name].blockConfirmations || 1
        // verify
    })
    log(`Deployed Dao Token to address ${daoToken.address}`)
    
    // Actualmente nadie tendria tokens, vamos a delegarselos al deployers para que despues pueda votar.
    // Asi tengo a alguien para que pueda votar
    await delegate(daoToken.address, deployer)

}

const delegate = async (daoTokenAddress: string, delegatedAccount: string) => {
    const daoToken = await ethers.getContractAt("DaoToken", daoTokenAddress)
    const tx = await daoToken.delegate(delegatedAccount) 
    // esta funcion viene de el rc20votes. Basicamente lo que hace es darle tu poder de votacion a otro 
    // (osea tus tokens) en base a un checkpoint. Recordemos que se van tomando snapshots y de acuerdo a 
    // lo que tengas en un momento dado se vota
    tx.wait(1)
    const checkpoints = await daoToken.numCheckpoints(delegatedAccount)
    console.log(`Checkpoints ${checkpoints}\n`)
}


export default deployGovernanceToken