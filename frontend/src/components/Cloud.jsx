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

        // Create a more visually appealing layout
        const centerX = 0;
        const centerY = 0;
        const radius = Math.min(width, height) / 3;

        svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("fill", (d, i) => {
                const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                return colors[i % colors.length];
            })
            .style("font-size", (d, i) => {
                // Vary font sizes for visual interest
                const baseSize = 24;
                const variation = Math.sin(i * 0.5) * 8;
                return `${baseSize + variation}px`;
            })
            .style("font-weight", "bold")
            .style("font-family", "Arial, sans-serif")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("x", (d, i) => {
                // Arrange words in a circular pattern
                const angle = (i * 2 * Math.PI) / words.length;
                return centerX + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
            })
            .attr("y", (d, i) => {
                const angle = (i * 2 * Math.PI) / words.length;
                return centerY + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
            })
            .attr("transform", (d, i) => {
                // Add slight rotation for visual interest
                const rotation = (Math.random() - 0.5) * 30;
                return `rotate(${rotation})`;
            })
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
                .words(words.map(word => ({ 
                    text: word, 
                    size: Math.random() * 40 + 20,
                    weight: Math.random() * 3 + 1
                })))
                .padding(10)
                .rotate(() => (Math.random() > 0.5 ? 0 : 90))
                .fontSize(d => d.size)
                .fontWeight(d => d.weight)
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

            const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

            svg
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("fill", (d, i) => colors[i % colors.length])
                .style("font-size", d => `${d.size}px`)
                .style("font-weight", d => d.weight ? `${d.weight * 100}` : 'bold')
                .style("font-family", "Arial, sans-serif")
                .style("cursor", "pointer")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text)
                .on("mouseover", function() {
                    d3.select(this).style("opacity", 0.7);
                })
                .on("mouseout", function() {
                    d3.select(this).style("opacity", 1);
                });
        }
    }, [words]);

    useEffect(() => {
        d3.select(svgRef.current).selectAll("*").remove();
        setHasError(false);
    }, [question]);

    if (hasError) {
        return (
            <div className="text-center py-8">
                <p className="text-lg text-red-500 mb-4">Error rendering word cloud</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {words.map((word, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return <svg ref={svgRef}></svg>;
};

export default WordCloud;
