import { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, transformArmyData } from "~/utils/constants"
import WarOfSiblora from "../utils/WarOfSiblora.json"

interface IAuthContext {
  user: any
  userArmy: any
  isLoading: boolean
  setUserArmy: any
  connectWallet: any
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined)

export const AuthContextProvider = (props: any) => {
  const [isLoading, setIsLoading] = useState(true)
  const [currentAccount, setCurrentAccount] = useState(null)
  const [userArmy, setUserArmy] = useState<any>(null)

  const checkNetwork = async () => {
    try {
      // @ts-ignore
      if (window.ethereum.networkVersion !== "4") {
        alert("Please connect to Rinkeby!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window

      if (!ethereum) {
        console.log("Make sure you have MetaMask!")
        setIsLoading(false)
        return
      } else {
        console.log("We have the ethereum object", ethereum)

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: "eth_accounts" })

        /*
         * User can have multiple authorized accounts, we grab the first one if it's there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0]
          console.log("Found an authorized account:", account)
          setCurrentAccount(account)
        } else {
          console.log("No authorized account found")
        }
      }
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask!")
        return
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      })

      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    /*
     * The function we will call that interacts with our smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log("Checking for Army NFT on address:", currentAccount)

      // @ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, WarOfSiblora.abi, signer)

      const txn = await gameContract.checkIfUserHasNFT()
      if (txn.faction) {
        console.log("User has army NFT")
        setUserArmy(transformArmyData(txn))
      } else {
        console.log("No army NFT found")
      }

      setIsLoading(false)
    }

    /*
     * We only want to run this if we have a connected wallet
     */
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount)
      fetchNFTMetadata()
    }
  }, [currentAccount])

  useEffect(() => {
    setIsLoading(true)
    checkNetwork()
    checkIfWalletIsConnected()
  }, [])

  const value = {
    isLoading,
    user: currentAccount,
    userArmy,
    setUserArmy,
    connectWallet
  }

  return <AuthContext.Provider value={value} {...props} />
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error(`useAuth must be used within an AuthContextProvider`)
  }
  return context
}
