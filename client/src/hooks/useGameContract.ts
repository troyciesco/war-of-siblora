import { Contract, ethers } from "ethers"
import { useEffect, useState } from "react"
import { CONTRACT_ADDRESS } from "~/utils/constants"
import WarOfSiblora from "../utils/WarOfSiblora.json"

export const useGameContract = () => {
  const [gameContract, setGameContract] = useState<Contract | null>(null)
  useEffect(() => {
    // @ts-ignore
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, WarOfSiblora.abi, signer)

      setGameContract(gameContract)
    } else {
      console.log("Ethereum object not found")
    }
  }, [])

  return gameContract
}
