export default function ProgressButton({
	cost,
	storage,
	clickHandler,
	children,
}) {
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

	return (
		<button disabled={!canAfford(cost)} onClick={() => clickHandler(cost)}>
			{children} {Math.round(progressToCost(cost) * 10000) / 100}%
		</button>
	);
}
