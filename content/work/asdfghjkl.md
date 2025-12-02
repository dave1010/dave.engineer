---
layout: work-item.njk
title: Asdfghjkl
description: "Keyboard-first mouse controller for macOS that navigates with a subdividing letter grid."
websiteUrl: /blog/2025/12/asdfghjkl-keyboard-first-mouse/
githubUrl: https://github.com/dave1010/Asdfghjkl
tags:
  - work
order: 6
---
Asdfghjkl overlays a 4×10 lettered grid across all connected displays so you can steer the mouse entirely from the keyboard. Each keystroke zooms into the matching cell until the pointer snaps to your target, giving pixel-level precision without using the trackpad.

A global `CGEventTap` keeps the controls responsive even when another app is focused, and a double-tap Command gesture toggles the overlay without stealing common shortcuts. The project separates the core grid math into a Swift package and leaves SwiftUI to render the overlay, making the navigation logic easy to test and extend.
