# DAO - Decentralized Autonomus Organization

Organizacion decentralizada, cuyas propuestas de mejoras o nuevas implementaciones son elegidas por la comunidad, mediante un mecanismo de votacion. Esta DAO puede ser full on-chain, o puede tener una arquitectura hibrida, siendo esta mas barata, pero a su vez mas compleja. 
Con respecto al mecanismo de votacion, puede ser mediante tokens (staking), por lo que los que mas tokens tengan, mas poder de decision tendran dentro de la organizacion ( como en las empresas con accionistas aprox); proof of personhood, que busca evitar que alguien realice muchas votaciones desde diferentes cuentas. Es un protocolo que busca relacionar a una persona identificable con una billetera, y de esa forma que sea como cuando uno vota en las elecciones: 1 persona = 1 voto.
Todo depende del enfoque que uno quiera darle

En este caso se emplea el mecanismo de votacion basado en tokens.

Mas info en: 
- https://docs.openzeppelin.com/contracts/4.x/governance
- https://docs.openzeppelin.com/contracts/4.x/wizard para generar los contratos customizados


## Install

- yarn
- yarn hardhat compile

## Run

### Localhost

- Levantar en una terminal el nodo local con <yarn hardhat node>
- Verificar que haya un objeto vacio en el archivo 'proposals.json'
- Correr en otra terminal los scripts con <yarn hardhat run scripts/script-name --network localhost>
- Correrlos en orden y se va a ver como se crea una propuesta, se vota y se ejecuta. Al finalizar se consulta el nuevo valor dentro de la caja