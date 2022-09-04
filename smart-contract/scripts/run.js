const main = async () => {
	const gameContractFactory = await hre.ethers.getContractFactory("WarOfSiblora")
	const gameContract = await gameContractFactory.deploy(
		["Sturgia", "Khuzait", "Battania", "Aserai", "Vlandia"],
		[
			"https://i.imgur.com/LWQ45Rq.png",
			"https://i.imgur.com/QGk8bWH.png",
			"https://i.imgur.com/dqzdpOJ.png",
			"https://i.imgur.com/Q6lmkYS.png",
			"https://i.imgur.com/YGlMjBT.png"
		],
		[123, 114, 124, 151, 168]
	)

	await gameContract.deployed()
	console.log("Contract deployed to:", gameContract.address)

	let txn
	txn = await gameContract.mintArmyNFT(2)
	await txn.wait()

	// Get the value of the NFT's URI.
	let returnedTokenUri = await gameContract.tokenURI(1)
	console.log("Token URI:", returnedTokenUri)

	txn = await gameContract.skirmish()
	await txn.wait()

	txn = await gameContract.skirmish()
	await txn.wait()
}

const runMain = async () => {
	try {
		await main()
		process.exit(0)
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}

runMain()
