//import logo from "./logo.svg";
import { useState } from "react";
import { useEffect } from "react";
import "./App.css";

import IncrementalProgressButton from "./components/IncrementalProgressButton";
import ProgressButton from "./components/ProgressButton";
import LevelNav from "./components/LevelNav";
import Level1 from "./Level1";

export default function App() {
	const [level, setLevel] = useState(1);
	const [maxLevel, setMaxLevel] = useState(1);
	const [tick, setTick] = useState(0);
	const now = new Date().toLocaleTimeString();
	const nowEpoch = new Date().valueOf();
	const [time, setTime] = useState(now);
	const [timeEpoch, setTimeEpoch] = useState(nowEpoch);
	const [output, setOutput] = useState("");
	const [outputBuffer, setOutputBuffer] = useState("");
	const [outputLength, setOutputLength] = useState(1);
	/* 	const [autoMinerCount, setAutoMinerCount] = useState(0);
	const [autoMiner1Count, setAutoMiner1Count] = useState(0);
	const [autoMiner0Count, setAutoMiner0Count] = useState(0); */
	const [storage, setStorage] = useState({ 0: 0, 1: 0 });
	const [resourceLabels, setResourceLabels] = useState({
		0: "nothing",
		1: "something",
		"00": "electrons",
		"01": "muons",
		10: "gluons",
		11: "positrons",
	}); //What things are called

	const [savedEpoch, setSavedTimeEpoch] = useState(nowEpoch); //for calculating stats
	const [savedStorage, setSavedStorage] = useState({ 0: 0, 1: 0 }); //for calculating stats
	const [miners, setMiners] = useState({
		0: {
			owned: 0,
			rate: 1.3,
			cost_base: [{ resource: 0, amount: 10 }],
			cost_next: [{ resource: 0, amount: 10 }],
		},
		1: {
			owned: 0,
			rate: 1.07,
			cost_base: [{ resource: 1, amount: 10 }],
			cost_next: [{ resource: 1, amount: 10 }],
		},
	});

	const [storageStats, setStorageStats] = useState({
		0: {
			producedPerTick: 0,
			producedPerSec: 0.0,
		},
		1: {
			producedPerTick: 0,
			producedPerSec: 0.0,
		},
	});

	const cost0Base = [{ resource: 0, amount: 10 }];
	const cost1Base = [{ resource: 1, amount: 10 }];

	const [cost0, setCost0] = useState(cost0Base);
	const [cost1, setCost1] = useState(cost1Base);

	const [unlocks, setUnlocks] = useState({
		NOTHING: true,
		SOMETHING: false,
		AUTOGATHER0: false,
		AUTOGATHER1: false,
	});

	const levelDefinitions = [
		Level1(storage, unlocks, handleUnlockNextLevel, resourceLabels),
		{
			title: "Subatomic Particles",
			introText: <div>The -ons</div>,
		},
		{
			title: "Atoms",
			introText: <div>The -ens</div>,
		},
	];

	/* Set timer to trigger main update loop */
	useEffect(() => {
		console.log(`initializing timer`);
		const interval = setInterval(() => {
			setTick((t) => t + 1);
		}, 250);

		return () => {
			console.log(`clearing timer`);
			clearInterval(interval);
		};
	}, []);

	/* Changing tick value fires off the main update loop */
	useEffect(() => {
		//console.log(`onTick Start`);
		//console.log(tick);

		const newTime = new Date().toLocaleTimeString();
		setTime(() => {
			return newTime;
		});
		const newEpoch = new Date().valueOf();
		const timeDiff = newEpoch - timeEpoch;
		setTimeEpoch(newEpoch);
		//console.log(timeDiff);

		const deltaTime = timeDiff / 1000; //time since last tick in seconds - used for scaling income on each tick
		const newStorage = doAutoGather(deltaTime);

		const statDeltaTicks = 12;
		if (tick % statDeltaTicks == 0) {
			//console.log(`do stats every ${statDeltaTicks} ticks`);
			const statsDiff = newEpoch - savedEpoch;
			const statsDeltaTime = statsDiff / 1000;

			const oldStorage = savedStorage;
			calcStats(oldStorage, newStorage, statsDeltaTime, statDeltaTicks);
			setSavedStorage(newStorage);
			setSavedTimeEpoch(newEpoch);
		}

		/*     const oldStorage = savedStorage;
		calcStats(oldStorage, newStorage, deltaTime); */

		return () => {
			//console.log(`onTick End`);
		};
	}, [tick]);

	function doAutoGather(deltaTime) {
		let tempStorage = storage;

		Object.keys(miners).forEach((key) => {
			tempStorage = incrementStorageCounter(
				key,
				tempStorage,
				Math.round(deltaTime * miners[key].owned * 100) / 100
			);
		});

		setStorage(tempStorage);

		return tempStorage;
	}

	function doGather(pNumTimes = 1) {
		if (pNumTimes === 0) {
			return "";
		}
		let gatheredItems = "";
		let gatheredItem = 0;
		for (let i = 0; i < pNumTimes; i++) {
			gatheredItem = randomNumberInRange(0, 1);
			gatheredItems = gatheredItems + gatheredItem;
		}

		console.log("Gathered a " + gatheredItems);
		return gatheredItems;
	}

	function calcStats(oldStorage, newStorage, deltaTime, deltaTicks = 4) {
		let newStorageStats = {
			0: {
				producedPerTick: 0,
				producedPerSec: 0.0,
			},
			1: {
				producedPerTick: 0,
				producedPerSec: 0.0,
			},
		};

		Object.keys(oldStorage).forEach((key) => {
			const oldResAmount = oldStorage[key];
			const diff = newStorage[key] - oldStorage[key];
			//console.log("diff:" + diff);
			const diffPerSec = diff / deltaTime;
			//console.log("diff per sec:" + diffPerSec);

			newStorageStats = {
				...newStorageStats,
				[key]: {
					producedPerTick: diff / deltaTicks,
					producedPerSec: diffPerSec,
				},
			};

			/* 			newStorageStats[key] = {
				producedPerTick: diff,
				producedPerSec: diffPerSec,
			}; */
		});

		setStorageStats(newStorageStats);
	}

	const randomNumberInRange = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/* Utility Functions */

	function transformCostArr(costArr, level, rate = 1.07) {
		let newCostArr = [];
		let newAmount;
		let oldAmount;
		let baseAmount = 100;

		costArr.forEach((cost) => {
			console.log("transforming... level:" + level);
			console.log("transforming... base amount:" + cost.amount);
			baseAmount = cost.amount;

			oldAmount = costExponential(level, rate, baseAmount);
			console.log("transforming... old amount:" + oldAmount);
			//newAmount = baseAmount * costLinear(level + 1, 10, 0);
			newAmount = Math.round(
				costExponential(level + 1, rate, baseAmount)
			);

			console.log("transforming... new amount:" + newAmount);
			newCostArr.push({
				resource: cost.resource,
				amount: newAmount,
			});
		});

		return newCostArr;
	}

	function costLinear(pLevel, pSlope = 2, pBase = 0) {
		return pLevel * pSlope + pBase;
	}

	function costExponential(owned, rate = 1.1, base = 10) {
		return base * Math.pow(rate, owned);
	}

	function cropOutput(pOutputBuffer = outputBuffer) {
		setOutput(pOutputBuffer.slice(0, outputLength));
		setOutputBuffer(pOutputBuffer.slice(outputLength));
	}

	function storeItem(pItem) {
		console.log("storeItem:" + pItem);
		if (pItem === "") {
			console.log("empty output =(");
			return;
		}
		//add output to storage
		console.log("Processing output:" + pItem);

		let newOutput = storage[pItem];
		if (isNaN(newOutput)) {
			newOutput = 0;
		}
		newOutput = newOutput + 1;

		setStorage({
			...storage,
			[pItem]: newOutput,
		});

		bufferItem(pItem);
	}

	function deductCost(costArr) {
		let canAfford = true;
		let tempStorage = storage;

		costArr.forEach((cost) => {
			/* 			
			console.log("have:" + storage[cost.resource]); */
			if (
				isNaN(storage[cost.resource]) ||
				storage[cost.resource] < cost.amount
			) {
				canAfford = false;
				console.log(
					"Can't afford that, why are you in here if you don't have the resources?"
				);
				return false; //Can't afford, we are we even here in the first place? =(
			}

			tempStorage = incrementStorageCounter(
				cost.resource,
				tempStorage,
				-cost.amount
			);

			setStorage(tempStorage);

			console.log("Spent " + cost.amount + " " + cost.resource);
		});

		if (!canAfford) {
			return false;
		}

		return true;
	}

	function canAfford(costArr) {
		let canAfford = true;
		costArr.forEach((cost) => {
			/* 			console.log("res:" + cost.resource + " amount:" + cost.amount);
			console.log("have:" + storage[cost.resource]); */
			if (
				isNaN(storage[cost.resource]) ||
				storage[cost.resource] < cost.amount
			) {
				canAfford = false;
			}
		});
		return canAfford;
	}

	function progressToCost(costArr) {
		let totalProgress = 0.0;
		let progress = 0.0;
		costArr.forEach((cost) => {
			/* 			console.log("res:" + cost.resource + " amount:" + cost.amount);
			console.log("have:" + storage[cost.resource]); */
			if (isNaN(storage[cost.resource])) {
				progress = 0.0;
			} else if (storage[cost.resource] >= cost.amount) {
				progress = 1.0;
			} else {
				progress = storage[cost.resource] / cost.amount;
			}
			totalProgress += progress;
		});
		return totalProgress / costArr.length;
	}

	function incrementStorageCounter(pItem, pStorage, pAmount = 1) {
		//console.log("incrementStorageCounter:" + pItem + " amount:" + pAmount);
		if (pItem === "") {
			return;
		}

		let newOutput = pStorage[pItem];
		if (isNaN(newOutput)) {
			newOutput = 0;
		}
		newOutput = fixFloatingPoint(newOutput + pAmount);

		return {
			...pStorage,
			[pItem]: newOutput,
		};
	}

	function bufferItem(pItem) {
		setOutputBuffer((b) => b + pItem);
	}

	/* Handlers */

	function handleUnlockSomething(cost = null) {
		console.log("CONGRATS, YOU UNLOCKED SOMETHING!");
		setUnlocks({ ...unlocks, SOMETHING: true });
		deductCost(cost);
	}

	function handleUnlockNextLevel(cost = null) {
		console.log("CONGRATS, YOU UNLOCKED LEVEL " + (maxLevel + 1));
		console.log(cost);
		const nextLevel = maxLevel + 1;
		setUnlocks({ ...unlocks, ["LEVEL" + nextLevel]: true });
		setMaxLevel(nextLevel);
		deductCost(cost);
	}

	function handleUnlockAutoGather0(pCost = null) {
		console.log("CONGRATS, YOU UNLOCKED Auto Gather 0!");
		setUnlocks({ ...unlocks, AUTOGATHER0: true });
		deductCost(pCost);
	}

	function handleUnlockAutoGather1(pCost = null) {
		console.log("CONGRATS, YOU UNLOCKED Auto Gather 1!");
		setUnlocks({ ...unlocks, AUTOGATHER1: true });
		deductCost(pCost);
	}

	function handleGatherItem(gatheredItem) {
		bufferItem(gatheredItem);
	}

	function handleGatherRandom() {
		let gatheredItem = doGather(1);
		setOutputBuffer((b) => b + gatheredItem);
	}

	/* 	function handleSubtractAutoMiner() {
		if (autoMinerCount > 0) {
			setAutoMinerCount((n) => n - 1);
		}
	} */
	/* 
  function handleAddAutoMiner() {
		if (autoMinerCount < 100) {
			setAutoMinerCount((n) => n + 1);
		}
	} */

	function handleAddMiner(resource) {
		console.log("handleAddMiner resource:" + resource);

		const miner = miners[resource];
		console.log("cost before: " + miner.cost_next[0].amount);

		deductCost(miner.cost_next);

		let newCost = transformCostArr(
			miner.cost_base,
			miner.owned,
			miner.rate
		);
		console.log("cost after: " + newCost[0].amount);

		let newMiner = {
			owned: miner.owned + 1,
			rate: miner.rate,
			cost_base: miner.cost_base,
			cost_next: newCost,
		};

		setMiners({ ...miners, [resource]: newMiner });
	}

	function fixFloatingPoint(value, recurringSymbols = 6) {
		if (!value || Number.isNaN(parseFloat(value))) {
			// value is wrong or empty
			return value;
		}

		const [intPart, decimalPart] = `${value}`.split(".");

		if (!decimalPart) {
			// no decimal part
			return value;
		}

		const regex = new RegExp(
			`(9{${recurringSymbols},}|0{${recurringSymbols},})(\\d)*$`,
			"gm"
		);
		const matched = decimalPart.match(regex);

		if (!matched) {
			// no floating-point bug
			return value;
		}

		const [wrongPart] = matched;
		const correctDecimalsLength = decimalPart.length - wrongPart.length;
		return parseFloat(
			parseFloat(`${intPart}.${decimalPart}`).toFixed(
				correctDecimalsLength
			)
		);
	}

	/* Components */

	//levelDefinitions;

	function Storage() {
		let content = Object.keys(storage).map((key) => {
			return (
				<div key={key}>{`${key}: ${Math.round(storage[key])} (${
					Math.round(storageStats[key].producedPerSec * 100) / 100
				}/s) [${
					Math.round(storageStats[key].producedPerTick * 100) / 100
				}/tick]`}</div>
			);
		});
		return <div>{content}</div>;
	}

	function PurchaseButton({ title, cost, clickHandler, children }) {
		return (
			<button
				disabled={!canAfford(cost)}
				onClick={() => clickHandler(cost)}
			>
				{children}
			</button>
		);
	}

	function ItemCounterOld({ attribute, subtractHandler, addHandler }) {
		return (
			<div className="buttons">
				<button onClick={subtractHandler}>-</button>
				<p>Auto Gather ({attribute})</p>
				<button onClick={addHandler}>+</button>
			</div>
		);
	}

	function ItemCounter({
		title,
		attribute,
		setStateFunction,
		minValue = 0,
		maxValue = 99,
	}) {
		function handleSubtract() {
			if (attribute > minValue) {
				setStateFunction((s) => s - 1);
			}
		}

		function handleAdd() {
			if (attribute < maxValue) {
				setStateFunction((s) => s + 1);
			}
		}

		return (
			<div className="buttons">
				<button onClick={handleSubtract}>-</button>
				<p>
					{title} ({attribute})
				</p>
				<button onClick={handleAdd}>+</button>
			</div>
		);
	}

	return (
		<div>
			<header>
				<p>Welcome to Blip, an incremental game of epic scale.</p>
			</header>

			<div className={`steps`}>
				<LevelNav
					level={level}
					levelDefinitions={levelDefinitions}
					maxLevel={maxLevel}
					setLevel={setLevel}
				/>

				<div className="message">
					Level {level}: {levelDefinitions[level - 1].title}
				</div>
				<div className="message">
					{levelDefinitions[level - 1].introText}
				</div>

				{/* 				<div className="buttons">
					<button onClick={handleGatherRandom}>
						Gather Resources
					</button>
					<ProgressButton
						cost={[
							{ resource: 0, amount: 1000 },
							{ resource: 1, amount: 1000 },
						]}
					>
						Unlock Progress (1000x0 + 1000x1)
					</ProgressButton>
				</div> */}

				{/* 				<div className="buttons">
					<button onClick={handleSubtractAutoMiner}>-</button>
					<p>Auto Gather ({autoMinerCount})</p>
					<button onClick={handleAddAutoMiner}>+</button>
				</div> */}

				{/* 				<ItemCounterOld
					attribute={autoMinerCount}
					subtractHandler={handleSubtractAutoMiner}
					addHandler={handleAddAutoMiner}
				/> */}

				{/* 				<ItemCounter
					title="Output Length"
					attribute={outputLength}
					setStateFunction={setOutputLength}
					minValue={1}
					maxValue={100}
				/> */}
			</div>

			<div className="container">
				<p>Max Level: {maxLevel}</p>
				<Storage />
				<p>Tick: {tick}</p>
				<p>Time: {time}</p>
				<p>Time Epoch: {timeEpoch}</p>
				<p>Output Length: {outputLength}</p>

				<div className="output">Output: {output}</div>
				<div className="output-buffer">
					Output Buffer: {outputBuffer}
				</div>
			</div>
		</div>
	);
}
