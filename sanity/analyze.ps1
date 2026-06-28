Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap("c:\Users\rc360\OneDrive\Desktop\sanity\puzzle.png")
$gs = 5
$tw = [int]($bmp.Width / $gs)
$th = [int]($bmp.Height / $gs)
$result = @()

for ($row = 0; $row -lt $gs; $row++) {
    for ($col = 0; $col -lt $gs; $col++) {
        $idx = $row * $gs + $col
        $sumL = 0.0
        $count = 0
        $startX = $col * $tw
        $startY = $row * $th
        for ($x = $startX; $x -lt ($startX + $tw); $x += 4) {
            for ($y = $startY; $y -lt ($startY + $th); $y += 4) {
                if ($x -lt $bmp.Width -and $y -lt $bmp.Height) {
                    $px = $bmp.GetPixel($x, $y)
                    $lum = 0.2126 * [double]$px.R + 0.7152 * [double]$px.G + 0.0722 * [double]$px.B
                    $sumL += $lum
                    $count++
                }
            }
        }
        $avg = if ($count -gt 0) { $sumL / $count } else { 0 }
        $result += "Tile $idx (r$row,c$col): $([math]::Round($avg, 2))"
    }
}

$result | ForEach-Object { Write-Host $_ }
$bmp.Dispose()
