@echo off
setlocal enabledelayedexpansion

:: Check if toucan_idle.png exists
if not exist "toucan_idle.png" (
    echo Error: toucan_idle.png not found in current directory
    exit /b 1
)

:: Process PNG files
for %%f in (toucan*.png) do (
    if /i not "%%f"=="toucan_idle.png" (
        echo Replacing %%f with toucan_idle.png content...
        copy /y "toucan_idle.png" "%%f" >nul
        if !errorlevel! equ 0 (
            echo Successfully replaced: %%f
        ) else (
            echo Failed to replace: %%f
        )
    )
)

:: Process JPG files
for %%f in (toucan*.jpg) do (
    echo Replacing %%f with toucan_idle.png content...
    copy /y "toucan_idle.png" "%%f" >nul
    if !errorlevel! equ 0 (
        echo Successfully replaced: %%f
    ) else (
        echo Failed to replace: %%f
    )
)

:: Process GIF files
for %%f in (toucan*.gif) do (
    echo Replacing %%f with toucan_idle.png content...
    copy /y "toucan_idle.png" "%%f" >nul
    if !errorlevel! equ 0 (
        echo Successfully replaced: %%f
    ) else (
        echo Failed to replace: %%f
    )
)

echo.
echo Done! All toucan images (PNG, JPG, GIF) have been replaced with toucan_idle.png content.
pause