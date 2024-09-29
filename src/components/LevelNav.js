export default function LevelNav({
	level,
	levelDefinitions,
	maxLevel,
	setLevel,
}) {
	function handlePrevious() {
		if (level > 1) {
			setLevel(level - 1);
		}
	}

	function handleNext() {
		if (level < levelDefinitions.length) {
			setLevel(level + 1);
		}
	}

	function LevelNavItem({ nav_level }) {
		return (
			<div
				className={`${level >= nav_level ? "active" : ""}`}
			>{`${nav_level}`}</div>
		);
	}

	let content = Object.keys(levelDefinitions).map((key, index) => {
		return (
			<LevelNavItem
				key={key}
				nav_level={Number(index + 1)}
			></LevelNavItem>
		);
	});

	return (
		<>
			<div className={`container ${maxLevel > 1 ? "" : "hidden"}`}>
				<div className="buttons">
					<button onClick={handlePrevious}>Previous</button>
					<button onClick={handleNext}>Next</button>
				</div>
				<div className="numbers">{content}</div>
			</div>
		</>
	);
}
