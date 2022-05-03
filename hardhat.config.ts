import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import {HardhatUserConfig} from 'hardhat/config'
// Equivalente al brownie-config-yaml

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat', // equivalente a la ganache cli que monta brownie cuando deployas los contratos en local
    solidity: {
        version: '0.8.8',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        } 
    },
    networks: {
        hardhat: { // esta es la red que se levanta cuando se corren los tests
            chainId: 31337
        },
        localhost: { // esta es la red que se levanta cuando levantas el nodo con hardhat node
            chainId: 31337
        }
    },
    namedAccounts: { // lista de cuentas que podemos usar
        deployer: {
            default: 0 // la cuenta numero 0-index se llama deployer
        }
    }
}

export default config