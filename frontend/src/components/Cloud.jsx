import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Import d3-cloud with fallback
let cloud = null;
try {
    const d3Cloud = require("d3-cloud");
    cloud = d3Cloud.default || d3Cloud;
} catch (error) {
    console.warn("d3-cloud not available, using fallback");
}

const WordCloud = ({ words, question }) => {
    const svgRef = useRef(null);
    const [hasError, setHasError] = useState(false);

    const createFallbackWordCloud = (words, width, height) => {
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const wordsPerRow = Math.ceil(Math.sqrt(words.length));
        const cellWidth = width / wordsPerRow;
        const cellHeight = height / wordsPerRow;

        svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
            .style("font-size", (d, i) => `${Math.random() * 30 + 16}px`)
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => (i % wordsPerRow - wordsPerRow/2) * cellWidth)
            .attr("y", (d, i) => (Math.floor(i / wordsPerRow) - wordsPerRow/2) * cellHeight)
            .text(d => d);
    };

    useEffect(() => {
        console.log("Cloud component received words:", words);
        if (!words.length) return;

        try {
            const width = 500;
            const height = 300;

            // ✅ Clear previous drawing
            d3.select(svgRef.current).selectAll("*").remove();

            // Check if cloud function is available
            if (!cloud || typeof cloud !== 'function') {
                console.warn('d3-cloud not available, using fallback layout');
                createFallbackWordCloud(words, width, height);
                return;
            }

            const layout = cloud()
                .size([width, height])
                .words(words.map(word => ({ text: word, size: Math.random() * 50 + 10 })))
                .padding(5)
                .rotate(() => (Math.random() > 0.5 ? 0 : 90))
                .fontSize(d => d.size)
                .on("end", draw);

            layout.start();
        } catch (error) {
            console.error('Error creating word cloud:', error);
            setHasError(true);
        }

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
        setHasError(false);
    }, [question]);

    if (hasError) {
        return (
            <div className="text-center text-red-500 py-8">
                <p className="text-lg">Error rendering word cloud</p>
                <p className="text-sm mt-2">Please refresh the page</p>
            </div>
        );
    }

    return <svg ref={svgRef}></svg>;
};

export default WordCloud;
