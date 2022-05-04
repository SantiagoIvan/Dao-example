import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import { ADDRESS_ZERO} from '../helper-hardhat-config'
import {ethers} from 'hardhat'

const setupGovernance: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre // seria el equivalente a lo que importo del modulo 'brownie' cuando lo hago con python
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    /**
     * A diferencia del get("ContractName") que use antes, este metodo toma el contrato ya deployado y asocia la cuenta
     * del segundo parametro a ese contrato, para que el 'from' sea de esa cuenta. Las llamadas que se hagan sobre el
     * contrato se haran desde 'deployer' en este caso.
     * Tambien se puede usar sin el segundo parametro. Lo importante es que el getContract me devuelve un objeto
     * con una interfaz igual a la del contrato. De esta forma, le envio mensajes al objeto, sin ocuparme de la complejidad
     * de comunicarme con el contrato en si.
     * 
     * deployments.get es la otra funcion que use antes. Me devuelve tanto la direccion como el ABI del contrato. 
     * Pero no me da esa ventaja que me da el getContract.
     */
    const governor = await ethers.getContract("GovernorContract", deployer) 
    const timelock = await ethers.getContract("TimeLock", deployer)

    log(`Setting up roles...`)
    /**
     * Solo el governor contract puede enviar propuestas al Timelock (a partir de las votaciones realizadas)
     * Cualquiera puede ejecutar las propuestas ya aceptadas que estan en cola ahi esperando, una vez transcurrido
     * el min_delay
     * 
     * Fuente: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/TimelockController.sol
     * 
     * Los roles tienen una bytecode asociado, que es basicamente el hash del string del rol
     * bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE");
     * bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
     * bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
     * bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");
    */
    const proposerRole = await timelock.PROPOSER_ROLE()
    const executorRole = await timelock.EXECUTOR_ROLE()
    const adminRole = await timelock.TIMELOCK_ADMIN_ROLE() // actualmente es el deployer, cosa que no quiero. Rompe con la decentralizacion
    
    // Estas funciones del Rol estan definidas en el contrato Access, que hereda justamente el TimeLockController
    const proposerTx = await timelock.grantRole(proposerRole, governor.address)
    await proposerTx.wait(1)
    const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO) // es una forma de decir que cualquiera puede ejecutar las propuestas ya aceptadas
    await executorTx.wait(1)
    // anulamos el rol de admin
    // const functions = await timelock.functions
    // console.log("Functions", functions) para ver todas las funciones que puedo ejecutar del contrato
    const adminTx = await timelock.revokeRole(adminRole, deployer)
    await adminTx.wait(1)

    log(`Governance Configured successfully!`)
    // a partir de ahora, como el nadie tiene el admin del Timelock, solo es posible realizar cambios en la DAO
    // armando una propuesta y ganando las elecciones ahre
}

export default setupGovernance