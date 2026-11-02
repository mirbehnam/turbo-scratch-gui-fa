#ifndef AppVersion
    #error AppVersion is required
#endif
#ifndef SourceDir
    #error SourceDir is required
#endif
#ifndef OutputDir
    #error OutputDir is required
#endif
#ifndef OutputBaseFilename
    #error OutputBaseFilename is required
#endif
#ifndef IconFile
    #error IconFile is required
#endif
#ifndef Is64Bit
    #define Is64Bit 0
#endif

[Setup]
AppId={{CA387779-9DD7-46C2-AE02-1FEA42B990CB}
AppName=TurboWarp FA
AppVersion={#AppVersion}
AppPublisher=TurboWarp contributors
DefaultDirName={localappdata}\Programs\TurboWarp FA
DefaultGroupName=TurboWarp FA
DisableDirPage=yes
DisableFinishedPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
DisableStartupPrompt=yes
DisableWelcomePage=yes
OutputDir={#OutputDir}
OutputBaseFilename={#OutputBaseFilename}
Compression=lzma2/fast
SolidCompression=yes
SetupIconFile={#IconFile}
PrivilegesRequired=lowest
SetupLogging=yes
UninstallDisplayIcon={app}\TurboWarpFA.exe
VersionInfoVersion={#AppVersion}
WizardStyle=modern
#if Is64Bit
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
#endif

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\TurboWarp FA"; Filename: "{app}\TurboWarpFA.exe"
Name: "{autodesktop}\TurboWarp FA"; Filename: "{app}\TurboWarpFA.exe"

[Run]
Filename: "{app}\TurboWarpFA.exe"; Description: "Launch TurboWarp FA"; Flags: nowait skipifsilent
