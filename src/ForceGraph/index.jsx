import { useState, useEffect } from 'react';
import { GraphGenerator } from "./GraphGenerator";
import { json as d3json } from 'd3';

// Utils
function createLinksArray(agentNodes) {
	let linksArray = [];
	agentNodes.map((agent, i) => {
		linksArray.push({
			source: 0, target: i + 1,
			weight: agent.packetsIn + agent.packetsOut,
			distance: Math.random() * (300 - 50) + 50,
			marker: 'ARROW',
			...agent
		})
	})
	return linksArray;
}

export const ForceGraph = () => {
	const [graphData, setGraphData] = useState();

	function loadJson() {
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

				setGraphData({ NODES, LINKS });
			})
			.catch(console.log);
	}

	useEffect(() => {
		loadJson();
	}, []);

	if (!graphData) return <>Loading...</>

	return (
		<div className="ForceGraph" style={{display: "flex", padding: "2rem", height: "100vh"}}>
			<button onClick={loadJson}>Update Graph {">> "} </button>
			<GraphGenerator data={graphData} />
		</div>
	);
}
