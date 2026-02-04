import 'dart:io';
import 'package:archive/archive.dart';
import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;

class InstallationService {
  static const String appName = "CrystalTidesSMP Launcher";
  static const String folderName = "CrystalTidesSMP";

  Future<String> getInstallationPath() async {
    final localAppData = Platform.environment['LOCALAPPDATA'];
    if (localAppData == null) throw Exception("Could not find LOCALAPPDATA");
    return p.join(localAppData, folderName);
  }

  Future<void> install({required Function(double) onProgress}) async {
    final installDir = await getInstallationPath();
    final directory = Directory(installDir);

    if (!directory.existsSync()) {
      directory.createSync(recursive: true);
    }

    onProgress(0.1); // Initial progress

    // Load payload from assets
    final data = await rootBundle.load('assets/payload/payload.zip');
    final bytes = data.buffer.asUint8List();

    onProgress(0.3);

    // Decode and extract
    final archive = ZipDecoder().decodeBytes(bytes);
    final totalFiles = archive.length;
    int extractedFiles = 0;

    for (final file in archive) {
      final filename = file.name;
      final filePath = p.join(installDir, filename);

      if (file.isFile) {
        final outFile = File(filePath);
        outFile.createSync(recursive: true);
        outFile.writeAsBytesSync(file.content as List<int>);
      } else {
        Directory(filePath).createSync(recursive: true);
      }

      extractedFiles++;
      onProgress(0.3 + (extractedFiles / totalFiles * 0.6));
    }

    onProgress(0.95);
    await _createShortcuts(installDir);
    onProgress(1.0);
  }

  Future<void> _createShortcuts(String installDir) async {
    // We will use a small PowerShell script to create shortcuts
    // because it's the most reliable way on Windows without native C++ code
    final exePath = p.join(installDir, 'launcher.exe');
    final desktopPath = p.join(
      Platform.environment['USERPROFILE']!,
      'Desktop',
      '$appName.lnk',
    );

    final psCommand =
        '''
\$WshShell = New-Object -ComObject WScript.Shell
\$Shortcut = \$WshShell.CreateShortcut("$desktopPath")
\$Shortcut.TargetPath = "$exePath"
\$Shortcut.WorkingDirectory = "$installDir"
\$Shortcut.Save()
''';

    await Process.run('powershell', ['-Command', psCommand]);
  }

  Future<void> launchApp() async {
    final installDir = await getInstallationPath();
    final exePath = p.join(installDir, 'launcher.exe');

    if (await File(exePath).exists()) {
      await Process.start(
        'cmd',
        ['/c', 'start', '', 'launcher.exe'],
        workingDirectory: installDir,
        mode: ProcessStartMode.detached,
      );
    }
  }
}
