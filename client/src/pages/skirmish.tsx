import type { NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useAuth } from "~/contexts/useAuth"
import { useGameContract } from "~/hooks/useGameContract"
import { transformArmyData } from "~/utils/constants"

const SkirmishPage: NextPage = () => {
 const router = useRouter()
 const { isLoading, user, userArmy, setUserArmy } = useAuth()
 const gameContract = useGameContract()
 const [empireArmy, setEmpireArmy] = useState<any>(null)
 const [attackStatus, setAttackStatus] = useState("")
 const [showToast, setShowToast] = useState(false)

 const runSkirmish = async () => {
  try {
   if (gameContract) {
    setAttackStatus("attacking")
    console.log("Attacking empire...")
    const attackTxn = await gameContract.skirmish()
    await attackTxn.wait()
    console.log("attackTxn:", attackTxn)
    setShowToast(true)
    setTimeout(() => {
     setShowToast(false)
    }, 5000)
   }
  } catch (error) {
   console.error("Error attacking empire:", error)
   setAttackStatus("")
  }
 }

 useEffect(() => {
  const fetchEmpire = async () => {
   const empireTxn = await gameContract!.getEmpireArmy()
   console.log("Empire:", empireTxn)
   setEmpireArmy(transformArmyData(empireTxn))
  }

  if (gameContract) {
   fetchEmpire()
  }
 }, [gameContract])

 useEffect(() => {
  const fetchEmpire = async () => {
   const empireTxn = await gameContract!.getEmpireArmy()
   console.log("Empire:", empireTxn)
   setEmpireArmy(transformArmyData(empireTxn))
  }

  /*
   * Setup logic when this event is fired off
   */
  const onSkirmishComplete = (from: any, newEmpireArmyUnitsActive: any, newPlayerArmyUnitsActive: any) => {
   const empireUnits = newEmpireArmyUnitsActive.toNumber()
   const playerUnits = newPlayerArmyUnitsActive.toNumber()
   const sender = from.toString()

   console.log(`SkirmishComplete: Empire Units: ${empireUnits} Player Units: ${playerUnits}`)

   if (user.toLowerCase() === sender.toLowerCase()) {
    setEmpireArmy((prevState: any) => {
     return { ...prevState, armyUnitsActive: empireUnits }
    })
    setUserArmy((prevState: any) => {
     return { ...prevState, armyUnitsActive: playerUnits }
    })
   } else {
    setEmpireArmy((prevState: any) => {
     return { ...prevState, armyUnitsActive: empireUnits }
    })
   }

   setAttackStatus("")
  }

  if (gameContract) {
   fetchEmpire()
   gameContract.on("SkirmishComplete", onSkirmishComplete)
  }

  /*
   * Make sure to clean up this event when this component is removed
   */
  return () => {
   if (gameContract) {
    gameContract.off("SkirmishComplete", onSkirmishComplete)
   }
  }
 }, [gameContract])

 if (!isLoading && !user) {
  router.replace("/")
 }

 if (isLoading || !userArmy) {
  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-900 text-yellow-100">
    <h1 className="text-5xl">LOADING</h1>
   </div>
  )
 }

 return !userArmy || !empireArmy ? null : (
  <main className="flex flex-col items-center justify-center min-h-screen bg-emerald-900 text-yellow-100">
   {showToast && (
    <div className="absolute top-8 bg-emerald-100 text-emerald-700 font-bold py-8 px-4 text-xl">
     <div>{`💥 ${empireArmy.faction} lost 50 troops! They have ${empireArmy.armyUnitsActive} left.`}</div>
     <div>{`💥 ${userArmy.faction} lost 50 troops! They have ${userArmy.armyUnitsActive} left.`}</div>
    </div>
   )}
   <h1 className="text-center text-7xl pb-10">Battlefield</h1>
   <div className="max-w-7xl px-8 grid grid-cols-3 mx-auto items-center justify-center">
    <div className="flex flex-col items-center justify-center">
     <h2 className="text-center text-5xl">{userArmy.faction}</h2>
     <img src={userArmy.imageURI} alt={userArmy.faction} />
     <p>{userArmy.armyUnitsActive} units</p>
    </div>
    <div className="flex items-center justify-center">
     {userArmy.armyUnitsActive > 0 && empireArmy.armyUnitsActive > 0 && (
      <button
       onClick={runSkirmish}
       className="inline-flex items-center rounded-md border border-transparent bg-red-500 px-6 py-3 text-4xl uppercase font-mono font-bold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
       Attack!
      </button>
     )}
     {userArmy.armyUnitsActive <= 0 && empireArmy.armyUnitsActive > 0 && <div className="text-center text-6xl">DEFEAT!</div>}
     {empireArmy.armyUnitsActive <= 0 && userArmy.armyUnitsActive > 0 && <div className="text-center text-6xl">VICTORY!</div>}
    </div>
    <div className="flex flex-col items-center justify-center">
     <h2 className="text-center text-5xl">{empireArmy.faction}</h2>
     <img src={empireArmy.imageURI} alt={empireArmy.faction} />
     <p>{empireArmy.armyUnitsActive} units</p>
    </div>
   </div>
   {attackStatus === "attacking" && (
    <div className="text-5xl text-center font-bold fixed inset-0 bg-slate-800/50 h-full w-full flex flex-col justify-center items-center text-white backdrop-blur-md">
     The battle wages on...you wait for a report.
    </div>
   )}
  </main>
 )
}

export default SkirmishPage
