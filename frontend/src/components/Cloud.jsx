import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { cloud } from "d3-cloud";

const WordCloud = ({ words, question }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!words.length) return;

        const width = 500;
        const height = 300;

        // ✅ Clear previous drawing
        d3.select(svgRef.current).selectAll("*").remove();

        const layout = cloud()
            .size([width, height])
            .words(words.map(word => ({ text: word, size: Math.random() * 50 + 10 })))
            .padding(5)
            .rotate(() => (Math.random() > 0.5 ? 0 : 90))
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();

        function draw(words) {
            const svg = d3
                .select(svgRef.current)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            svg
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
                .style("font-size", d => `${d.size}px`)
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text);
        }
    }, [words]);

    useEffect(() => {
        d3.select(svgRef.current).selectAll("*").remove();
    }, [question]);

    return <svg ref={svgRef}></svg>;
};

export default WordCloud;
