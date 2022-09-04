import { ArmyData } from "./types"

const CONTRACT_ADDRESS = "0x74163B0d18e73F3600C060BD0460954227A27119"

const transformArmyData = (armyData: ArmyData) => {
  return {
    faction: armyData.faction,
    imageURI: armyData.imageURI,
    armyUnitsActive: armyData.armyUnitsActive.toNumber(),
    armyUnitsWounded: armyData.armyUnitsWounded.toNumber()
  }
}

export { CONTRACT_ADDRESS, transformArmyData }
