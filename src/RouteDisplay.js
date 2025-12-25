import React from "react";

function RouteDisplay({ speciesList, migrationRoutes }) {
    if (!migrationRoutes || migrationRoutes.length === 0) {
        return (
            <div className="route-display-empty">
                No migration routes selected
            </div>
        );
    }

    // Group routes by source for cleaner display
    const routesBySource = {};
    migrationRoutes.forEach(route => {
        if (!routesBySource[route.source]) {
            routesBySource[route.source] = [];
        }
        routesBySource[route.source].push(route.target);
    });

    return (
        <div className="route-display">
            <div className="route-display-title">Selected migration routes:</div>
            <div className="route-list">
                {migrationRoutes.map((route, index) => (
                    <div key={index} className="route-item">
                        <span className="route-source">{route.source}</span>
                        <span className="route-arrow">→</span>
                        <span className="route-target">{route.target}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RouteDisplay;
