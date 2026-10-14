#!/usr/bin/env python3
"""Patch expo-modules build.gradle files to fix Gradle 8.x compatibility issues."""
import re
import glob
import os

patches_applied = 0

# Patch 1: Comment out `from components.release` in all expo modules
# This is the maven-publishing block that fails with newer AGP
for f in glob.glob('node_modules/expo-*/android/build.gradle') + ['node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle']:
    if not os.path.exists(f):
        continue
    with open(f) as fh:
        content = fh.read()

    original = content

    # Replace `from components.release` with a commented version
    # But only if it's not already commented
    content = re.sub(
        r'^(\s*)(from components\.release)',
        r'\1// \2  // PATCHED: disabled for Gradle 8.x compat',
        content,
        flags=re.MULTILINE
    )

    # Replace deprecated compileSdkVersion with compileSdk
    content = re.sub(
        r'compileSdkVersion\s+safeExtGet',
        'compileSdk safeExtGet',
        content
    )
    content = re.sub(
        r'minSdkVersion\s+safeExtGet',
        'minSdk safeExtGet',
        content
    )
    content = re.sub(
        r'targetSdkVersion\s+safeExtGet',
        'targetSdk safeExtGet',
        content
    )

    # Same for project.ext.safeExtGet
    content = re.sub(
        r'compileSdkVersion\s+project\.ext\.safeExtGet',
        'compileSdk project.ext.safeExtGet',
        content
    )
    content = re.sub(
        r'minSdkVersion\s+project\.ext\.safeExtGet',
        'minSdk project.ext.safeExtGet',
        content
    )
    content = re.sub(
        r'targetSdkVersion\s+project\.ext\.safeExtGet',
        'targetSdk project.ext.safeExtGet',
        content
    )

    if content != original:
        with open(f, 'w') as fh:
            fh.write(content)
        patches_applied += 1
        print(f'Patched: {f}')

# Patch 2: Force compileSdk in expo modules that skip it due to expoProvidesDefaultConfig
for f in glob.glob('node_modules/expo-*/android/build.gradle'):
    if not os.path.exists(f):
        continue
    with open(f) as fh:
        content = fh.read()

    # Pattern: android { if (!safeExtGet("expoProvidesDefaultConfig", false)) { compileSdk ... } }
    # Replace with: android { compileSdk 35 ... }
    pattern = r'(android\s*\{)\s*// Remove this if[^\n]*\n\s*if\s*\(!safeExtGet\("expoProvidesDefaultConfig",\s*false\)\)\s*\{\s*compileSdk\s+safeExtGet\("compileSdkVersion",\s*\d+\)\s*defaultConfig\s*\{\s*minSdk\s+safeExtGet\("minSdkVersion",\s*\d+\)\s*targetSdk\s+safeExtGet\("targetSdkVersion",\s*\d+\)\s*\}\s*publishing\s*\{\s*singleVariant\("release"\)\s*\{\s*withSourcesJar\(\)\s*\}\s*\}\s*lintOptions\s*\{\s*abortOnError\s+false\s*\}\s*\}'

    replacement = r'\1\n  compileSdk 35\n  defaultConfig {\n    minSdk 24\n    targetSdk 34\n  }'

    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    if new_content != content:
        with open(f, 'w') as fh:
            fh.write(new_content)
        patches_applied += 1
        print(f'Fixed compileSdk: {f}')

# Patch 3: Add top-level ext block to android/build.gradle
with open('android/build.gradle') as f:
    content = f.read()

if 'Top-level ext' not in content:
    ext_block = """// Top-level ext (needed for expo-modules which use safeExtGet)
ext {
    buildToolsVersion = findProperty('android.buildToolsVersion') ?: '35.0.0'
    minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
    compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '35')
    targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '34')
    kotlinVersion = findProperty('android.kotlinVersion') ?: '1.9.25'
    ndkVersion = '27.1.12297006'
}

"""
    content = content.replace('// Top-level build file', ext_block + '// Top-level build file')
    with open('android/build.gradle', 'w') as f:
        f.write(content)
    patches_applied += 1
    print('Added top-level ext block')

# Update ndkVersion in build.gradle
with open('android/build.gradle') as f:
    content = f.read()
content = content.replace('ndkVersion = "26.1.10909125"', 'ndkVersion = "27.1.12297006"')
with open('android/build.gradle', 'w') as f:
    f.write(content)

# Patch 4: Add SDK versions to gradle.properties
with open('android/gradle.properties') as f:
    content = f.read()

if 'android.compileSdkVersion' not in content:
    content += """

# Android SDK versions (needed for expo-modules)
android.compileSdkVersion=35
android.targetSdkVersion=34
android.minSdkVersion=24
android.buildToolsVersion=35.0.0
android.kotlinVersion=1.9.25
"""
    with open('android/gradle.properties', 'w') as f:
        f.write(content)
    patches_applied += 1
    print('Added SDK versions to gradle.properties')

print(f'\n{patches_applied} patches applied')
