$gitDir = "C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$gitDir*") {
    $newPath = "$currentPath;$gitDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Output "Successfully added Git to User PATH"
} else {
    Write-Output "Git is already in User PATH"
}
