import { useEffect } from "react";

export default function IncrementalProgressButton({
	resourceName,
	costNext,
	storage,
	clickHandler,
	children,
}) {
	/* 0: {
        owned: 0,
        cost_base: [{ resource: 0, amount: 10 }],
        cost_next: [{ resource: 0, amount: 10 }],
      } */
	useEffect(() => {
		console.log(
			`IncrementalProgressButton start resource: ${resourceName}`
		);
		console.log(costNext);

		return () => {
			console.log(
				`IncrementalProgressButton end resource: ${resourceName}`
			);
		};
	}, []);

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

	//console.log("Levelling cost");
	//let leveledCost = transformCostArr(cost, level);
	return (
		<button
			disabled={!canAfford(costNext)}
			onClick={() => clickHandler(costNext)}
		>
			{children} {"["}
			{costNext[0].amount}
			{"] "}
			{Math.round(progressToCost(costNext) * 10000) / 100}%
		</button>
	);
}
