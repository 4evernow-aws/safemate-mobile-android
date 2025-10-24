@echo off
echo ?? Creating SafeMate Android Desktop Shortcut...
cd /d "d:\safemate-mobile-android"
echo ? Directory set to: %CD%
echo ?? Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('C:\Users\simon.woods\Desktop\SafeMate Android.lnk'); $Shortcut.TargetPath = 'C:\Users\simon.woods\AppData\Local\Programs\cursor\Cursor.exe'; $Shortcut.Arguments = 'd:\safemate-mobile-android'; $Shortcut.WorkingDirectory = 'd:\safemate-mobile-android'; $Shortcut.Save()"
echo ? Desktop shortcut created!
pause
