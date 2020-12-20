# Toogl Track to ETS
> CLI tool to convert Toggle Track Detailed Report to ETS report in Excel format

## Installation
`npm install -g toggl-to-ets`

## Usage
`$ tte --token {TogglToken} --start "YYYY-MM-DD" --end "YYYY-MM-DD"`
- `token` - Toggl API Token. To get an API token go to Project Settings section in Toggle UI.
- `start` - Optional. The start date parameter. Default value is the 1st day of the current month.
- `end` - Optional. The end date parameter. Default value is the last day of the current month.