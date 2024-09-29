import IncrementalProgressButton from "./components/IncrementalProgressButton";
import ProgressButton from "./components/ProgressButton";

export default function Level1({
	storage,
	unlocks,
	handleUnlockNextLevel,
	resourceLabels,
}) {
	return {
		title: "The beginning",
		introText: (
			<>
				<div className="container panel">
					<ProgressButton
						cost={[
							{ resource: 0, amount: 1 },
							{ resource: 1, amount: 1 },
						]}
						storage={storage}
						clickHandler={handleUnlockNextLevel}
					>
						Unlock Next Level
					</ProgressButton>
				</div>

				<div className="container panel">
					In the beginning there was&nbsp;
					<a href="#" onClick={() => storeItem("0")}>
						{resourceLabels[0]}
					</a>
					<div className="container">{Math.round(storage[0])}</div>
					{/* Hide when SOMETHING is unlocked */}
					<div
						className={`container ${
							unlocks.SOMETHING ? "hidden" : ""
						}`}
					>
						<ProgressButton
							cost={[{ resource: 0, amount: 10 }]}
							storage={storage}
							clickHandler={handleUnlockSomething}
						>
							Unlock Progress (10x0)
						</ProgressButton>
					</div>
					<div
						className={`container ${
							unlocks.SOMETHING === true &&
							unlocks.AUTOGATHER0 === false
								? ""
								: "hidden"
						}`}
					>
						<ProgressButton
							cost={[{ resource: 0, amount: 10 }]}
							storage={storage}
							clickHandler={handleUnlockAutoGather0}
						>
							Unlock Auto Gather 0 (100x0)
						</ProgressButton>
					</div>
					<div
						className={`container ${
							unlocks.AUTOGATHER0 ? "" : "hidden"
						}`}
					>
						<h2>Auto Gather {resourceLabels[0]}</h2>
						<div className="container">
							Owned: {miners[0].owned}
						</div>
						<IncrementalProgressButton
							resourceName={0}
							costNext={miners[0].cost_next}
							storage={storage}
							clickHandler={() => handleAddMiner(0)}
						>
							Buy
						</IncrementalProgressButton>
					</div>
				</div>

				<div
					className={`container panel ${
						unlocks.SOMETHING ? "" : "hidden"
					}`}
				>
					<div>
						Then, there was{" "}
						<a href="#" onClick={() => storeItem("1")}>
							{resourceLabels[1]}
						</a>
						<div className="container">
							{Math.round(storage[1])}
						</div>
						<div
							className={`container ${
								unlocks.AUTOGATHER1 ? "hidden" : ""
							}`}
						>
							<ProgressButton
								cost={[{ resource: 1, amount: 10 }]}
								storage={storage}
								clickHandler={handleUnlockAutoGather1}
							>
								Unlock Auto Gather 1
							</ProgressButton>
						</div>
					</div>
					<div
						className={`container ${
							unlocks.AUTOGATHER1 ? "" : "hidden"
						}`}
					>
						<h2>Auto Gather {resourceLabels[1]}</h2>
						<div className="container">
							Owned: {miners[1].owned}
						</div>
						<IncrementalProgressButton
							resourceName={1}
							costNext={miners[1].cost_next}
							storage={storage}
							clickHandler={() => handleAddMiner(1)}
						>
							Buy
						</IncrementalProgressButton>
					</div>
				</div>
			</>
		),
		resources: ["0", "1"],
	};
}
