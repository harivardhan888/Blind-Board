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
        console.log("Creating fallback word cloud with words:", words);
        
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

        // Create text elements
        const textElements = svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("fill", (d, i) => colors[i % colors.length])
            .style("font-size", (d, i) => {
                const baseSize = 32;
                const variation = Math.sin(i * 0.8) * 12;
                return `${baseSize + variation}px`;
            })
            .style("font-weight", "bold")
            .style("font-family", "Arial, sans-serif")
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d);

        // Position words in a spiral pattern
        textElements.each(function(d, i) {
            const angle = (i * 2 * Math.PI) / words.length;
            const radius = 80 + (i * 15); // Spiral outward
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            d3.select(this)
                .attr("x", x)
                .attr("y", y)
                .attr("transform", `rotate(${(Math.random() - 0.5) * 20})`);
        });

        // Add hover effects
        textElements
            .on("mouseover", function() {
                d3.select(this)
                    .style("opacity", 0.7)
                    .style("font-size", function() {
                        const currentSize = d3.select(this).style("font-size");
                        return parseFloat(currentSize) * 1.2 + "px";
                    });
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("opacity", 1)
                    .style("font-size", function() {
                        const currentSize = d3.select(this).style("font-size");
                        return parseFloat(currentSize) / 1.2 + "px";
                    });
            });

        console.log("Fallback word cloud created successfully");
    };

    useEffect(() => {
        console.log("Cloud component received words:", words);
        if (!words.length) return;

        try {
            const width = 500;
            const height = 300;

            // ✅ Clear previous drawing
            d3.select(svgRef.current).selectAll("*").remove();

            // Always use the fallback layout for now to ensure it works
            console.log("Using fallback word cloud layout");
            createFallbackWordCloud(words, width, height);
            
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
        // Clear SVG when question changes, but don't clear words
        d3.select(svgRef.current).selectAll("*").remove();
        setHasError(false);
        
        // Re-render words if they exist
        if (words.length > 0) {
            console.log("Re-rendering words after question change:", words);
            const width = 500;
            const height = 300;
            createFallbackWordCloud(words, width, height);
        }
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

    // If no words, show waiting message
    if (!words.length) {
        return (
            <div className="text-center text-gray-500 py-8">
                <p className="text-lg">No words to display</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <svg ref={svgRef} className="w-full h-full"></svg>
            {/* HTML fallback overlay - always show words */}
            <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 pointer-events-none">
                {words.map((word, index) => (
                    <span
                        key={`${word}-${index}`}
                        className="px-4 py-2 bg-white shadow-lg rounded-lg text-lg font-bold pointer-events-auto"
                        style={{
                            color: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'][index % 8],
                            transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
                            fontSize: `${32 + Math.random() * 16}px`
                        }}
                    >
                        {word}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default WordCloud;
