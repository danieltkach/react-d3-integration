import { useEffect, useRef } from 'react';
import switchIcon from './switch_icon.svg';
import agentIcon from './agent_icon.svg';
import * as d3 from 'd3';

// Chart container dimensions ---
let svgWidth = 1300, svgHeight = 800;

// Constants ---
const forceManyBody = -1000;
const distance = 180;
const styles = {
	switch: {
		size: 30,
		fill: '#bbb',
		strokeColor: 'green',
		strokeWidth: 4,
		icon: switchIcon
	},
	agent: {
		size: 30,
		fill: 'white',
		strokeColor: '#bbb',
		strokeWidth: 2,
		icon: agentIcon
	}
}
const linkStyles = {
	onlineColor: '#212322',
	offlineColor: 'gray',
	strokeWidth: 2,
}

export const GraphGenerator = ({ data }) => {
	const { NODES, LINKS } = data;
	let svgRef = useRef();

	useEffect(() => {
		// Main SVG container ---
		svgRef.current = d3.select('#viz')
			// .append('svg')
			.attr('width', svgWidth)
			.attr('height', svgHeight)
			.append('g');

		// Scales domain and range ---
		const linkWeightScale = d3.scaleLinear()
			.domain([0, d3.max(LINKS.map(link => link.weight))])
			.range([3, 13]);

		const linkDashedScale = d3.scaleOrdinal()
			.domain([0])
			.range(['4 8']);

		// SVGs creation ---
		const linkSvg = svgRef.current
			.selectAll('path')
			.data(LINKS)
			// .enter()
			.join(
				enter => enter.append('path')
					.attr('stroke', d => !d.weight ? "gray" : linkStyles.onlineColor)
					.attr('stroke-width', d => linkWeightScale(d.weight))
					.attr('stroke-dasharray', d => {
						if (!d.weight) return linkDashedScale(d.weight)
					}),
				update => update,
				exit => exit.call(exit=>exit).remove()
			)


		// Define the gradient ---
		var gradient = svgRef.current.append("svg:defs")
			.append("svg:radialGradient")
			.attr("id", "gradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");
		gradient.append("svg:stop")
			.attr("offset", "0%")
			.attr("stop-color", "#F1DCB7")
			.attr("stop-opacity", 1);
		gradient.append("svg:stop")
			.attr("offset", "100%")
			.attr("stop-color", "#212322")
			.attr("stop-opacity", 1);

		// Nodes ---
		const circles = svgRef.current
			.selectAll()
			.data(NODES)
			.join("g");
		circles
			.append("circle")
			.attr("r", d => styles[d.type].size)
			.attr("fill", "#212322");
		circles
			.append("circle")
			.attr("r", d => styles[d.type].size * Math.random())
			.attr("fill", 'url(#gradient)')
			.attr("stroke-width", 1);

		// Images and icons ---
		const imageContainer = svgRef.current
			.selectAll('g.imageContainer')
			.data(NODES)
			.enter()
			.append('g');
		imageContainer
			.append('image')
			.attr('height', d => styles[d.type].size)
			.attr('width', d => styles[d.type].size)
			.attr('transform', d => `translate(${-styles[d.type].size / 2}, ${-styles[d.type].size / 2})`)
			.attr('href', d => styles[d.type].icon)

		// Set up graph simulation ---
		const simulation = d3.forceSimulation(NODES)
			.force("charge", d3.forceManyBody().strength(forceManyBody))
			.force("link", d3.forceLink(LINKS).id(d => d.d3id).distance(d => d.distance))
			.force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2));

		simulation.on("tick", () => {
			circles
				.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
			imageContainer
				.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
			linkSvg
				.attr("d", d => d3.line()([
					[d.source.x, d.source.y],
					[d.target.x, d.target.y],
				])
				);
		})
	}, [data]);

	return (
		<svg id="viz" ref={svgRef}></svg>
	)
}