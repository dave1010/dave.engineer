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

I built a new macOS tool in Swift called [Asdfghjkl](https://github.com/dave1010/Asdfghjkl) that lets you avoid the trackpad and control the mouse using the keyboard instead. It overlays a grid on the active screens, maps each cell to a letter, and keeps subdividing as you type until the pointer lands where you want it.

This post covers the architecture, the ergonomic choices, and some of the things I didn't bother with.

## Keyboard-first navigation

The grid starts as 4 rows by 10 columns. Each key maps to a sub-rectangle; typing the letter zooms into that slice and draws the next grid. Because every keystroke shrinks the search space, you can reach a pixel-precise target in a couple of taps instead of sweeping the trackpad.

The grid is aware of multiple displays. Columns are partitioned across screens so the left side of the keyboard stays aligned with the left-most monitor and the right side with the right-most one. That way I never have to think about DPI differences or which display currently has focus.

## Event handling without focus

Standard AppKit events only fire when an app is front-most, so Asdfghjkl hooks a `CGEventTap` to see keystrokes even when another app is active. The tap decides whether to consume the event (for grid navigation) or pass it through untouched.

## A launch gesture that avoids collisions

I wanted a trigger that feels intentional but does not steal common shortcuts. I went for "double-tap Command": tap ⌘ twice within a short window to toggle the overlay. If you hold ⌘ and press another key in between, the gesture is cancelled so copy/paste and similar shortcuts keep working. The state machine for this lives next to the event tap code and tracks timing, modifier use, and reset conditions.

## Clean separation of logic and visuals

The core math and state machines live in a Swift package, while the app target is just SwiftUI glue that renders an observable overlay model. This split makes it easy to unit test the grid math without mocking windows or screens, and it keeps the UI layer free of low-level event code.

## What is still rough

Asdfghjkl works brilliantly for me but probably not for you.

* **Code signing:** the build is unsigned, so you need to use `xattr` to prevent Gatekeeper from blocking it. Signing requires an Apple developer subscription, which I don't need at the moment.
* **Distribution:** the current install process is to just download from Github (or build it yourself). I've distributed software via Brew before but it didn't seem sensible without code signing.
* **Permissions onboarding:** controlling the mouse requires Accessibility permission. Right now that is a one-off alert. A proper onboarding flow that checks `AXIsProcessTrusted()` would make setup clearer.
* **User preferences:** the default 4×10 layout works for me, but power users will probably want to tweak rows, columns, and keymaps.

If you want to try it, clone the repo and build the app from Xcode, or grab the packaged binary from the GitHub releases. Feedback is welcome.
