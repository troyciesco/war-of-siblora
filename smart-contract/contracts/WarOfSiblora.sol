// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";
import "./libraries/Base64.sol";

contract WarOfSiblora is ERC721 {
    struct ArmyAttributes {
        uint256 armyIndex;
        string faction;
        string imageURI;
        uint256 armyUnitsActive;
        uint256 armyUnitsWounded;
        // uint256 cavalryUnitsActive;
        // uint256 infantryUnitsActive;
        // uint256 rangedUnitsActive;
        // uint256 cavalryUnitsWounded;
        // uint256 infantryUnitsWounded;
        // uint256 rangedUnitsWounded;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    ArmyAttributes[] defaultArmies;

    mapping(uint256 => ArmyAttributes) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;

    struct EmpireArmy {
        string faction;
        string imageURI;
        uint256 armyUnitsActive;
        uint256 armyUnitsWounded;
        // uint256 cavalryUnitsActive;
        // uint256 infantryUnitsActive;
        // uint256 rangedUnitsActive;
        // uint256 cavalryUnitsWounded;
        // uint256 infantryUnitsWounded;
        // uint256 rangedUnitsWounded;
    }

    EmpireArmy public empireArmy;

    event ArmyNFTMinted(address sender, uint256 tokenId, uint256 armyIndex);

    event SkirmishComplete(
        address sender,
        uint256 newEmpireArmyUnitsActive,
        uint256 newPlayerArmyUnitsActive
    );

    constructor(
        string[] memory factionNames,
        string[] memory factionImageURIs,
        uint256[] memory armyUnitsActive
    ) ERC721("Armies", "ARMY") {
        empireArmy = EmpireArmy({
            faction: "Empire",
            imageURI: "https://i.imgur.com/ilo2YBp.jpeg",
            armyUnitsActive: 10000,
            armyUnitsWounded: 0
        });

        console.log(
            "Done initializing empire army %s w/ %s units, img %s",
            empireArmy.faction,
            empireArmy.armyUnitsActive,
            empireArmy.imageURI
        );

        for (uint256 i = 0; i < factionNames.length; i += 1) {
            defaultArmies.push(
                ArmyAttributes({
                    armyIndex: i,
                    faction: factionNames[i],
                    imageURI: factionImageURIs[i],
                    armyUnitsActive: armyUnitsActive[i],
                    armyUnitsWounded: 0
                })
            );

            ArmyAttributes memory aa = defaultArmies[i];

            console.log(
                "Done initializing %s w/ %s units, img %s",
                aa.faction,
                aa.armyUnitsActive,
                aa.imageURI
            );
        }

        // increment _tokenIds here so that first NFT has an ID of 1.
        _tokenIds.increment();
    }

    function mintArmyNFT(uint256 _armyIndex) external {
        uint256 newItemId = _tokenIds.current();

        // assigns tokenId to caller's wallet address
        _safeMint(msg.sender, newItemId);

        nftHolderAttributes[newItemId] = ArmyAttributes({
            armyIndex: _armyIndex,
            faction: defaultArmies[_armyIndex].faction,
            imageURI: defaultArmies[_armyIndex].imageURI,
            armyUnitsActive: defaultArmies[_armyIndex].armyUnitsActive,
            armyUnitsWounded: defaultArmies[_armyIndex].armyUnitsWounded
        });

        console.log(
            "Minted NFT w/ tokenId %s and armyIndex %s",
            newItemId,
            _armyIndex
        );

        // Keep an easy way to see who owns what NFT.
        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();
        emit ArmyNFTMinted(msg.sender, newItemId, _armyIndex);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        ArmyAttributes memory armyAttributes = nftHolderAttributes[_tokenId];

        string memory strArmyUnitsActive = Strings.toString(
            armyAttributes.armyUnitsActive
        );
        string memory strArmyUnitsWounded = Strings.toString(
            armyAttributes.armyUnitsWounded
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"faction": "',
                armyAttributes.faction,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                '", "description": "This is an army that lets the holder battle in the War of Siblora", "image": "',
                armyAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Army Units Active", "value": ',
                strArmyUnitsActive,
                '}, { "trait_type": "Army Units Wounded", "value": ',
                strArmyUnitsWounded,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function skirmish() public {
        // Get the state of the player's Army.
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        ArmyAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];

        console.log(
            "\nPlayer w/ a %s army is about to attack. Has %s army units ready to fight",
            player.faction,
            player.armyUnitsActive
        );

        console.log(
            "Empire Army has %s army units ready to fight",
            empireArmy.armyUnitsActive
        );

        // make sure player and empire have enough active army units
        require(
            player.armyUnitsActive > 0,
            "Error: player must have active army units"
        );
        require(
            empireArmy.armyUnitsActive > 0,
            "Error: empire must have active army units"
        );

        // Allow player to attack empire.
        if (empireArmy.armyUnitsActive < 50) {
            empireArmy.armyUnitsActive = 0;
        } else {
            empireArmy.armyUnitsActive = empireArmy.armyUnitsActive - 50;
        }

        // Allow empire to attack player.
        if (player.armyUnitsActive < 50) {
            player.armyUnitsActive = 0;
        } else {
            player.armyUnitsActive = player.armyUnitsActive - 50;
        }

        // Console for ease.
        console.log(
            "Player attacked empire. New empire active units: %s",
            empireArmy.armyUnitsActive
        );
        console.log(
            "Empire attacked player. New player active units: %s\n",
            player.armyUnitsActive
        );
        emit SkirmishComplete(
            msg.sender,
            empireArmy.armyUnitsActive,
            player.armyUnitsActive
        );
    }

    function checkIfUserHasNFT() public view returns (ArmyAttributes memory) {
        // Get the tokenId of the user's character NFT
        uint256 userNftTokenId = nftHolders[msg.sender];
        // If the user has a tokenId in the map, return their army.
        if (userNftTokenId > 0) {
            return nftHolderAttributes[userNftTokenId];
        }
        // Else, return an empty army.
        else {
            ArmyAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultArmies()
        public
        view
        returns (ArmyAttributes[] memory)
    {
        return defaultArmies;
    }

    function getEmpireArmy() public view returns (EmpireArmy memory) {
        return empireArmy;
    }
}
