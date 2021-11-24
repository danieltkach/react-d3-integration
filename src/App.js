import { useState, useEffect } from 'react';
import { ForceGraph } from "./ForceGraph/ForceGraph";
import { json as d3json } from 'd3';

// Utils
function createLinksArray(agentNodes) {
	const n = agentNodes.length;
	let linksArray = [];
	agentNodes.map((agent, i) => {
		linksArray.push({
			source: 0, target: i + 1,
			weight: agent.packetsIn + agent.packetsOut,
			distance: Math.random() * (350 - 70) + 70,
			marker: 'ARROW',
			// marker: Math.random()*2 > 1 ? 'ARROW' : null,
			...agent
		})
	})
	return linksArray;
}

function App() {
	const [graphData, setGraphData] = useState();

	function loadJson() {
		console.log('LOADJSON')
		d3json('https://jsonkeeper.com/b/2EN4')
			.then(res => {
				let data = res[0];

				// Format data structure ---
				const switchNode = {
					d3id: 0,
					type: 'switch',
					name: data.selectedSwitch.sdmcSwitch.instanceName
				};
				const agentsNodes = data.agentsState.rates.agentsRates.map((x, i) => ({ d3id: i + 1, type: x.type, name: x.agentName, ...x }));
				let NODES = [switchNode, ...agentsNodes];
				let LINKS = createLinksArray(agentsNodes);

				setGraphData({NODES, LINKS});
			})
			.catch(console.log);
	}

	useEffect(() => {
		loadJson();
	}, []);

	if (!graphData) return <>Loading...</>

	return (
		<div className="App">
			<button onClick={loadJson}>New Graph</button>
			<ForceGraph data={graphData} />
		</div>
	);
}

export default App;
