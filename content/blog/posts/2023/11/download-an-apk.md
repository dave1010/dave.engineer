---
title: "Extracting an Installed APK from an Android Device"
date: 2023-11-22
tags:
  - android
type: til
---
I was trying to get a copy of an Android app APK file today.
This can be really handy if you need to back up an app that's not on the Play Store anymore,
or if you're trying to debug a problem and you don't have the original source code.
It's also useful for sending an app to a device that doesn't have access to the Play Store, or for inspecting the app for security reasons.

This used to be a straightforward task, but Google's shift to using Android App Bundles (AABs) has made it a bit more challenging.
AABs are an upload format that includes all the app’s compiled code and resources,
but they rely on Google Play to generate and sign the actual APK files that are installed on devices.
This means you don't get a single APK file from the Play Store anymore, which adds a few extra steps to extract an APK from a device.

## Steps to Extract an APK

There's loads of guides online but this is what worked for me, with some help from ChatGPT.

1. **Enable USB Debugging**:
   - Go to `Settings > About phone` on your Android device.
   - Tap `Build number` seven times to enable `Developer options`.
   - In `Developer options`, enable `USB debugging`.

2. **Install ADB**:
   - Install Android Debug Bridge (ADB) from [Android SDK Platform-Tools](https://developer.android.com/tools) on your computer.

3. **Connect Your Device**:
   - Connect your Android device to your computer via USB.

4. **Check ADB Device Connection**:
   - Run `adb devices` in your terminal to ensure your device is properly connected.

5. **Find the Package Name**:
   - Use `adb shell pm list packages | grep [App_Name]` to find the package name of the app.

6. **Extract the APK**:
   - Find the path of the APK with `adb shell pm path [Package_Name]`.
   - Pull the APK to your computer using `adb pull [APK_File_Path]`. This will put it in the current directory.
