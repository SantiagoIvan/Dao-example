// SPDX-License-Identifier: MIT

// este va a ser el dueño del Box, y sera el que despues de un delay ejecutara
// las propuestas ya aceptadas, que estaran en cola esperando ser ejecutadas.

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    // minDelay: una vez que una propuesta es aceptada, se espera como minimo esta cantidad de tiempo
    // proposers es una lista de quienes pueden hacer una propuesta. En este caso seria cualquiera, ya que no le puse ninguna restriccion al propouse threshold
    // executors es una lista de quienes pueden ejecutar una propuesta una vez que es aceptada, en este caso tamien seria cualquiera

    constructor(
        uint256 _minDelay,
        address[] memory _proposers,
        address[] memory _executors
    ) TimelockController(_minDelay, _proposers, _executors) {}
}
