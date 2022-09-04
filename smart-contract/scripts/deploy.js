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
