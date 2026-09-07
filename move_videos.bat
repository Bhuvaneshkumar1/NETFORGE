@echo off
if not exist demo_video mkdir demo_video
for %%f in (*.mp4) do (
    move "%%f" "demo_video\demo_walkthrough.mp4"
)
echo Video moved and renamed to demo_video\demo_walkthrough.mp4 successfully!
pause
