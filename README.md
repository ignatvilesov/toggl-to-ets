# Toogl to ETS
> Convert Toggle Detailed report to ETS report

## Installation
`npm install -g toggl-to-ets`

## Usage
`$ tte --token {TogglToken} --since "YYYY-MM-DD" --until "YYYY-MM-DD" --projects "ProjectName1;ProjectName2" --ets "PathToEtsExcelTemplate"`

## Notes
Report template downloaded from `ETS` system has `.xls` format. This tool supports `.xlsx` only. To convert `.xls` into `.xlsx` just open Microsoft Word and save as `.xlsx`. If you are on Mac, Linux or just have no opportunity to convert the report through desktop Microsoft Word you can easily do the same using Google Documents in the cloud.
