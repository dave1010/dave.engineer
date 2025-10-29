---
title: 2D Vector Visualizer
description: Plot 2D vectors with live metrics.
category: Visualization
---

## Features

- Visualize a vector from any origin with live updates to the drawing.
- Inspect magnitude, angle, and a cardinal direction label while you adjust components.
- Drag the scale slider to zoom the grid for close-up or wide views.
- Works offline and keeps all computation in the browser.

## Usage

1. Enter the vector components in the X and Y fields. Negative values are supported.
2. (Optional) Shift the vector's origin to see where it starts on the plane.
3. Use the scale slider to change how many pixels each unit spans.
4. Read the calculated magnitude, angle (in degrees and radians), and direction below the canvas.

## Tips

- The canvas redraws automatically; try resizing the window if you want a larger plotting area.
- Angles follow the mathematical convention: 0° points east and rotate counter-clockwise.
- Set both components to 0 to focus on the origin—useful for teaching coordinate systems.
