import type React from "react"
interface JsonCrackEmbedProps {
  jsonUrl: string
  aspectRatio?: string // can be percentage or viewport height
  className?: string
}

export function JsonCrackEmbed({ jsonUrl, aspectRatio, className }: JsonCrackEmbedProps) {
  const src = `https://jsoncrack.com/widget?json=${encodeURIComponent(jsonUrl)}`

  // Check if aspectRatio contains "vh" to determine if it's a fixed height
  const isFixedHeight = aspectRatio?.includes("vh")

  // If no aspectRatio is provided, assume we want to fill the container
  const style: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
  }

  // If aspectRatio is provided, adjust the style
  if (aspectRatio) {
    if (isFixedHeight) {
      style.height = aspectRatio
    } else {
      style.paddingTop = aspectRatio
    }
  }

  return (
    <div className={className} style={style}>
      <iframe
        src={src}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allowFullScreen
        title="JSON Crack Visualization"
      />
    </div>
  )
}

export default JsonCrackEmbed
