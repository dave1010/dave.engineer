---
title: "Asdfghjkl: a keyboard-first mouse controller for macOS"
date: 2025-12-01
tags:
  - macos
  - accessibility
  - automation
  - keyboard
  - open-source
---

I built a new macOS tool called [Asdfghjkl](https://github.com/dave1010/Asdfghjkl) that lets me park the trackpad and drive the cursor with the home row. It overlays a grid on the active screens, maps each cell to a letter, and keeps subdividing as I type until the pointer lands where I want it. This post covers the architecture, the ergonomic choices, and what still needs tightening.

## Keyboard-first navigation

The grid starts as 4 rows by 10 columns. Each key maps to a sub-rectangle; typing the letter zooms into that slice and draws the next grid. Because every keystroke shrinks the search space, I can reach a pixel-precise target in a couple of taps instead of sweeping the trackpad.

The grid is aware of multiple displays. Columns are partitioned across screens so the left side of the keyboard stays aligned with the left-most monitor and the right side with the right-most one. That way I never have to think about DPI differences or which display currently has focus.

## Event handling without focus

Standard AppKit events only fire when an app is front-most, so Asdfghjkl hooks a `CGEventTap` to see keystrokes even when another app is active. The tap decides whether to consume the event (for grid navigation) or pass it through untouched. If the app ever stops responding, macOS kills the tap, so the callback stays deliberately thin and hands work to a dedicated input manager.

## A launch gesture that avoids collisions

I wanted a trigger that feels intentional but does not steal common shortcuts. The result is a "double-tap Command" heuristic: tap ⌘ twice within a short window to toggle the overlay. If you hold ⌘ and press another key in between, the gesture is cancelled so copy/paste and similar shortcuts keep working. The state machine for this lives next to the event tap code and tracks timing, modifier use, and reset conditions.

## Clean separation of logic and visuals

The core math and state machines live in a Swift package, while the app target is just SwiftUI glue that renders an observable overlay model. This split makes it easy to unit test the grid math without mocking windows or screens, and it keeps the UI layer free of low-level event code.

## What is still rough

* **Event tap resilience:** macOS will disable the tap if it stalls. A heartbeat that restarts the tap on failure would make the utility more robust.
* **Permissions onboarding:** controlling the mouse requires Accessibility permission. Right now that is a one-off alert; a proper onboarding flow that checks `AXIsProcessTrusted()` would make setup clearer.
* **Grid preferences:** the default 4×10 layout works for me, but power users will probably want to tweak rows, columns, and keymaps. Surfacing those options in settings is on the list.

If you want to try it, clone the repo and build the app from Xcode, or grab the packaged ZIP from the GitHub releases once a tag is published. Feedback is welcome, especially from people who spend all day in the terminal and want to keep their hands on the keyboard.
