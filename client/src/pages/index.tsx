import type { NextPage } from "next"
import Link from "next/link"
import { SelectFaction } from "~/components/SelectFaction"
import { useAuth } from "~/contexts/useAuth"

const Home: NextPage = () => {
	const { isLoading, user, userArmy, connectWallet } = useAuth()
	if (isLoading) {
		return <h1 className="text-5xl">Loading the kingdom...</h1>
	}
	return (
		<main className="min-h-screen bg-cyan-900 text-yellow-100 flex flex-col items-center justify-center">
			<div className="mb-8">
				<h1 className="text-[96px]">The War of Siblora</h1>
				<p className="text-lg max-w-prose mb-4 mx-auto">
					The continent of Siblora is at war. The tyrannic reign of the Empire under Rotbertus the Cold has gone on for far too long. A
					rebellion is brewing, a joint effort by the factions across the continent.
				</p>
				<p className="text-lg max-w-prose mx-auto mb-4">
					Unfortunately for the rebellion, Emperor Rotbertus has a massive army the likes of which the world has never seen. Clans from
					every faction will have to raise armies and chip away at Emperor Rotbertus's forces.
				</p>
				<p className="text-lg max-w-prose mx-auto mb-4">
					This is where you come in. As a leader in your faction, your people are looking to you to band them together and lead attacks (and
					defenses). Your faction determines the makeup of your army.
				</p>
			</div>
			<div>
				{!user && (
					<button
						type="button"
						onClick={connectWallet}
						className="inline-flex items-center rounded-md border border-transparent bg-green-500 px-6 py-3 text-xl uppercase font-mono font-bold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
						Connect to Metamask
					</button>
				)}
				{user && !userArmy && <SelectFaction />}
				{user && userArmy && (
					<div>
						<h2 className="text-center text-5xl mb-4">Your Faction: {userArmy.faction}</h2>
						<div className="flex gap-8">
							<img src={userArmy.imageURI} alt={userArmy.faction} className="h-80 w-80 object-cover" />
							<div>
								<p className="text-center text-3xl font-bold mb-8">
									Available Units:
									<br />
									{userArmy.armyUnitsActive}
								</p>
								{userArmy && userArmy.armyUnitsActive > 0 ? (
									<Link href="/skirmish">
										<a className="inline-flex items-center rounded-md border border-transparent bg-red-500 px-6 py-3 text-xl uppercase font-mono font-bold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
											Go to Battle!
										</a>
									</Link>
								) : (
									<p className="text-center">You have been defeated.</p>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	)
}

export default Home
