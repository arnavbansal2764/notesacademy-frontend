// This file would be used to configure mermaid globally
// In a real project, you would install mermaid with:
// npm install mermaid

import mermaid from "mermaid"

export function initMermaid() {
    mermaid.initialize({
        startOnLoad: true,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif",
    })
}

