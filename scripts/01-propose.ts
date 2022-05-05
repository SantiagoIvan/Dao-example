import '@nomiclabs/hardhat-ethers'
import { ethers, network } from 'hardhat'
import { moveBlocks } from '../utils/moveBlocks'
import {
    FUNCTION_TO_CALL,
    PROPOSAL_DESCRIPTION,
    VALUE_TO_STORE,
    developmentChains,
    VOTING_DELAY,
    proposalsPath,
} from '../utils/utils'
import fs from 'fs'

const propose = async (func: string, args: any[], description: string) => {
    const governor = await ethers.getContract('GovernorContract')
    const box = await ethers.getContract('Box')

    /*
    ahora necesito ejecutar la funcion propose.
    https://betterprogramming.pub/how-to-code-an-on-chain-dao-e525e13a57be en este documento esta explicada la firma de la funcion

    necesito codificar la funcion a ejecutar junto con sus parametros
    contractInstance.interface.encodeFunctionData(
        functionToCall,
        [args]
    )

    propose([77], 'store'),
    Propongo guardar el valor 77 en el BOX. Como esto lo voy a usar mas adelante tambien en los tests
    Guardo esos valores en el utils. Basicamente porque es la unica funcion que tiene el contrato Box.
    */
    const encodedFunctionCall = box.interface.encodeFunctionData(func, args)

    console.log(encodedFunctionCall)
    // ahora creamos la transaccion

    console.log(
        `Creating propose transaction on. Func: ${FUNCTION_TO_CALL}; Args: ${VALUE_TO_STORE}; Description: ${description}`
    )
    /**
     * Esta funcion de propose seria equivalente a un Command pattern si se quieren. Se encapsula:
     * 1er arg: Una lista de targets. Que es lo que voy a querer modificar con mi propuesta?
     * 2do arg: Una lista de 'values', por si mando ether, o la moneda que sea.
     * 3er arg: Una lista de Funcion+argumentos codificada.
     * 4to arg: Descripcion de la propuesta que se pretende realizar
     *
     * Esas listas deben tener la misma cantidad de elementos, y se matchean por index. Al box le pretendo mandar 0 ether y quiero que ejecute esa funcion con esos argumentos
     * Si hubiera otros contratos target que son afectados por mi propuesta, tambien deberia sumarlo a la lista de targets y deberia tambien
     * agregar la nueva funcion+argumentos y el nuevo value a sus respectivos arrays
     */
    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        PROPOSAL_DESCRIPTION
    )
    const receipt = await proposeTx.wait(1)

    // Si estamos en local, vamos a tener que implementar de otra forma eso del delay.
    if (developmentChains.includes(network.name)) {
        moveBlocks(VOTING_DELAY + 2)
    }

    // fijandome en el contrato, veo que emite un evento, donde uno de los argumentos es el proposalId
    // Voy a necesitar eso cuando quiera votar y en el otro script. Lo voy a guardar en un archivo 'proposals.json' cosa de poder accederlo
    // como solo emite un evento, el que quiero esta en events[0]
    const proposalId = receipt.events[0].args.proposalId
    let proposals = JSON.parse(fs.readFileSync(proposalsPath, 'utf8'))

    // vamos a guardar una lista de propuestas, por cada red
    if (proposals[network.name])
        proposals[network.name].push(proposalId.toString())
    else proposals[network.name] = [proposalId.toString()]

    fs.writeFileSync(proposalsPath, JSON.stringify(proposals))
}

propose(FUNCTION_TO_CALL, [VALUE_TO_STORE], PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log('Network: ', network.name)
        console.log('An error has been encountered', { error })
        process.exit(1)
    })
