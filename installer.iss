[Setup]
AppId={{FA4013DD-97E9-49CD-B47C-93501261e20D}
AppName=CrystalTides Launcher
AppVersion=1.0.0
AppPublisher=CrystalTidesSMP
DefaultDirName={autopf}\CrystalTides Launcher
DisableProgramGroupPage=yes
OutputDir=installer
OutputBaseFilename=CrystalTides_Setup
SetupIconFile=windows\runner\resources\app_icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
; One-Click / Minimalist Settings
DisableWelcomePage=no
DisableDirPage=yes
DisableReadyPage=yes
DisableFinishedPage=no
AllowNoIcons=yes
; Branded Images
WizardImageFile=assets\images\installer_banner.bmp
WizardSmallImageFile=assets\images\app_icon.bmp

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "build\windows\x64\runner\Release\launcher.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\CrystalTides Launcher"; Filename: "{app}\launcher.exe"
Name: "{autodesktop}\CrystalTides Launcher"; Filename: "{app}\launcher.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\launcher.exe"; Description: "{cm:LaunchProgram,CrystalTides Launcher}"; Flags: nowait postinstall skipifsilent

[Code]
procedure InitializeWizard();
begin
  // Hide Legacy UI Elements for a "One-Click" feel
  WizardForm.Bevel.Visible := False;
  WizardForm.BeveledLabel.Visible := False;
  WizardForm.MainPanel.Visible := False;
  
  // Custom font styling
  WizardForm.WelcomeLabel1.Font.Size := 14;
  WizardForm.WelcomeLabel1.Font.Style := [fsBold];
  WizardForm.WelcomeLabel1.Top := WizardForm.WelcomeLabel1.Top + 20;
  WizardForm.WelcomeLabel2.Top := WizardForm.WelcomeLabel1.Top + WizardForm.WelcomeLabel1.Height + 10;
end;
