import { useEffect, useState } from "react"
import { useAuth } from "~/contexts/useAuth"
import { useGameContract } from "~/hooks/useGameContract"
import { transformArmyData } from "~/utils/constants"
import { ArmyData } from "~/utils/types"

export const SelectFaction = () => {
	const gameContract = useGameContract()
	const [factions, setFactions] = useState<any>(null)
	const { setUserArmy } = useAuth()
	const [isMintingArmy, setIsMintingArmy] = useState<boolean>(false)

	const mintArmyNFT = async (armyId: any) => {
		try {
			if (gameContract) {
				setIsMintingArmy(true)

				console.log("Minting character in progress...")
				const mintTxn = await gameContract.mintArmyNFT(armyId)
				await mintTxn.wait()
				console.log("mintTxn:", mintTxn)
				setIsMintingArmy(false)
			}
		} catch (error) {
			console.warn("MintArmyAction Error:", error)
			setIsMintingArmy(false)
		}
	}

	useEffect(() => {
		const getFactions = async () => {
			try {
				console.log("Getting contract factions to mint")

				const armiesTxn = await gameContract!.getAllDefaultArmies()
				console.log("armiesTxn:", armiesTxn)

				const armies = armiesTxn.map((armyData: ArmyData) => transformArmyData(armyData))

				setFactions(armies)
			} catch (error) {
				console.error("Something went wrong fetching factions:", error)
			}
		}

		const onArmyMint = async (sender: any, tokenId: any, characterIndex: any) => {
			console.log(`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`)

			/*
			 * Once our character NFT is minted we can fetch the metadata from our contract
			 * and set it in state to move onto the Arena
			 */
			if (gameContract) {
				const armyNFT = await gameContract.checkIfUserHasNFT()
				console.log("armyNFT: ", armyNFT)
				setUserArmy(transformArmyData(armyNFT))
			}
		}

		if (gameContract) {
			getFactions()
			gameContract.on("ArmyNFTMinted", onArmyMint)
		}

		return () => {
			if (gameContract) {
				gameContract.off("ArmyNFTMinted", onArmyMint)
			}
		}
	}, [gameContract])

	return (
		<div className="max-w-7xl mx-auto py-10">
			<h2 className="text-center text-5xl mb-4">Choose Your Faction</h2>
			{factions && factions.length > 0 && (
				<div className="flex gap-8 flex-wrap justify-center">
					{factions.map((faction: any, index: number) => {
						return (
							<div key={index} className="bg-white text-black rounded-md shadow-md py-4">
								<h3 className="text-center text-3xl">{faction.faction}</h3>
								<div className="h-80 w-80 p-8 mb-1">
									<img src={faction.imageURI} alt={faction.faction} className="w-full h-full object-cover rounded-md border-2" />
								</div>
								<p className="mb-4 text-center">{faction.armyUnitsActive} active units</p>
								<div className="flex items-center justify-center">
									<button
										onClick={() => mintArmyNFT(index)}
										className="inline-flex items-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-md uppercase font-mono font-bold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
										Raise an Army!
									</button>
								</div>
							</div>
						)
					})}
				</div>
			)}
			{isMintingArmy && (
				<div className="text-5xl text-center font-bold fixed inset-0 bg-slate-800/50 h-full w-full flex flex-col justify-center items-center text-white backdrop-blur-md">
					Raising an army, this might take a bit...
				</div>
			)}
		</div>
	)
}
