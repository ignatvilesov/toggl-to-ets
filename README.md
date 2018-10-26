# Toogl to ETS
> Convert Toggle Detailed report to ETS report

## Installation
`npm install -g toggl-to-ets`

## Usage
`$ tte --token {TogglToken} --since "YYYY-MM-DD" --until "YYYY-MM-DD" --projects "ProjectName1;ProjectName2"`
- `token` - Toggl API Token. To get it go to Project Settings section in Toggle UI.
- `since` - Optional. The start date parameter. Default value is the 1st day of the current month.
- `until` - Optional. The end date parameter. Default value is the last day of the current month.
- `projects` - Optional. Toggle projects to include in report. By default includes all the projects.
