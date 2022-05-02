// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract DaoToken is ERC20Votes {
    uint256 public s_maxSupply;

    // Supongamos que hay una nueva propuesta.
    // Puede pasar que haya un monton de revuelo, que haya mucha compra de tokens y que despues de la propuesta se vendan todos
    // haciendo que la moneda pierda valor, que la dao pierda valor
    // Queremos evitar esto, por lo tanto se trabaja con snapshots

    // Esto es una foto del estado de las cuentas en un determinado momento. Cuantos token tiene alguien en un determinado momento

    // Por eso no se utiliza la version estandar de ERC20, sino que se utiliza otro contrato que tiene unas funciones
    // especiales para estos casos, ERC20Votes
    constructor() ERC20("DaoToken", "DT") ERC20Permit("DaoToken") {
        s_maxSupply = 1000000000000000000000000; // 1 millon de tokens
        _mint(msg.sender, s_maxSupply);
    }

    // override de algunas funciones que heredamos que necesitamos sobrescribir,

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
