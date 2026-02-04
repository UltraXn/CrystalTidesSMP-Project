import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:window_manager/window_manager.dart';
import 'services/installation_service.dart';

class CrystalTidesSMPInstaller extends StatelessWidget {
  const CrystalTidesSMPInstaller({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      ),
      home: const InstallerHome(),
    );
  }
}

class InstallerHome extends StatefulWidget {
  const InstallerHome({super.key});

  @override
  State<InstallerHome> createState() => _InstallerHomeState();
}

enum InstallerStep { welcome, selectPath, installing, finish }

const Map<String, Map<String, String>> _i18n = {
  'Español': {
    'header': 'CrystalTidesSMP Launcher installer',
    'welcome': 'Bienvenido a la Experiencia',
    'destination': 'Seleccione Destino',
    'dest_sub': 'Elija la ubicación para los archivos del cliente',
    'path_label': 'Carpeta de instalación:',
    'terms_pre': 'He leído y acepto los ',
    'terms_link': 'Términos de Servicio',
    'terms_and': ' y la ',
    'privacy_link': 'Política de Privacidad',
    'terms_post': ' de CrystalTidesSMP.',
    'configuring': 'Configurando CrystalTidesSMP',
    'status_pre': 'Preparando sistema...',
    'status_start': 'Iniciando descarga segura...',
    'status_sync': 'Sincronizando con CrystalTidesSMP Cloud...',
    'status_config': 'Configurando entorno local...',
    'status_opt': 'Optimizando launcher...',
    'ready': 'Listo para el Despliegue',
    'finish_sub': 'La instalación ha finalizado con éxito.',
    'btn_continue': 'CONTINUAR',
    'btn_install': 'INSTALAR',
    'btn_start': 'COMENZAR',
    'terms_title': 'Términos y Condiciones',
    'terms_content': '''
1. SOFTWARE DE CÓDIGO ABIERTO
CrystalTidesSMP Launcher es un proyecto de código abierto. Aunque el código es accesible, el uso de este binario y el acceso a nuestros servicios están sujetos a las reglas aquí descritas.

2. NO AFILIACIÓN
CrystalTidesSMP NO es un producto oficial de Minecraft ni está afiliado con Mojang AB o Microsoft. Minecraft y sus activos son propiedad de sus respectivos dueños.

3. REQUISITOS DE EDAD
Debes tener al menos 13 años para utilizar nuestros servicios. Si eres menor de 18, debes contar con el permiso de tus padres o tutor.

4. REGLAS DE LA COMUNIDAD (SMP)
El uso de este launcher para acceder al servidor implica la aceptación de nuestras reglas de convivencia. Se prohíbe terminantemente el uso de hacks, cheats o cualquier herramienta que otorgue una ventaja injusta sobre otros jugadores.

5. PRIVACIDAD
Recopilamos datos mínimos (UUID de Minecraft, versión del sistema) exclusivamente para permitir el acceso al servidor y prevenir accesos de usuarios sancionados (Bans). No vendemos tus datos a terceros.

6. SIN GARANTÍA
El software se proporciona "tal cual", sin garantías de ningún tipo. No nos hacemos responsables de pérdidas de datos o problemas técnicos derivados de su uso.
    ''',
    'privacy_title': 'Política de Privacidad',
    'privacy_content': '''
Esta Política de Privacidad describe las prácticas de datos de CrystalTidesSMP y sus colaboradores ("nosotros", "nuestro"). Al usar nuestros Servicios, usted acepta esta Política y el procesamiento de sus datos.

1. NO PARA MENORES
Los servicios no están destinados a niños. Si no tienes al menos 13 años, no puedes acceder a los servicios.

2. INFORMACIÓN QUE RECOPILAMOS
Recopilamos información técnica mínima necesaria para el funcionamiento del servidor SMP y nuestra web:
- Identificadores: Nombre de usuario de Minecraft, Minecraft UUID, dirección IP y dirección de correo electrónico.
- Actividad: Registros de conexión, marcas de tiempo y datos de colisión (crashes).
- Hardware: Versión del sistema operativo y especificaciones básicas para optimización.

3. USO DE LA INFORMACIÓN
Utilizamos los datos para:
- Proporcionar acceso al servidor SMP y gestionar su cuenta en nuestra web.
- Mantener la seguridad y prevenir ataques DDOS.
- Aplicar sanciones (Bans) en caso de violar las reglas de la comunidad.
- Optimizar el rendimiento del launcher.

4. COMPARTICIÓN DE DATOS
Compartimos su UUID de Minecraft con los servicios oficiales de autenticación de Microsoft/Mojang para validar su cuenta. No vendemos su información personal a terceros.

5. SEGURIDAD
Implementamos medidas de seguridad razonables para proteger su información, aunque ningún sistema en Internet es 100% seguro.

6. SUS DERECHOS
Usted tiene derecho a solicitar la eliminación de sus datos de acceso enviando una solicitud a nuestro equipo de soporte.
    ''',
    'btn_back': 'VOLVER',
  },
  'English': {
    'header': 'CrystalTidesSMP Launcher installer',
    'welcome': 'Welcome to the Experience',
    'destination': 'Select Destination',
    'dest_sub': 'Choose the location for the client files',
    'path_label': 'Installation folder:',
    'terms_pre': 'I have read and accept the ',
    'terms_link': 'Terms of Service',
    'terms_and': ' and ',
    'privacy_link': 'Privacy Policy',
    'terms_post': ' of CrystalTidesSMP.',
    'configuring': 'Configuring CrystalTidesSMP',
    'status_pre': 'Preparing system...',
    'status_start': 'Starting secure download...',
    'status_sync': 'Syncing with CrystalTidesSMP Cloud...',
    'status_config': 'Configuring local environment...',
    'status_opt': 'Optimizing launcher...',
    'ready': 'Ready for Deployment',
    'finish_sub': 'The installation has completed successfully.',
    'btn_continue': 'CONTINUE',
    'btn_install': 'INSTALL',
    'btn_start': 'START',
    'terms_title': 'Terms and Conditions',
    'terms_content': '''
1. OPEN SOURCE SOFTWARE
CrystalTidesSMP Launcher is an open-source project. While the source code is accessible, the use of this binary and access to our services are subject to the rules described here.

2. NON-AFFILIATION
CrystalTidesSMP is NOT an official Minecraft product and is not affiliated with Mojang AB or Microsoft. Minecraft and its assets are property of their respective owners.

3. AGE REQUIREMENTS
You must be at least 13 years old to use our services. If you are under 18, you must have permission from your parents or guardian.

4. COMMUNITY RULES (SMP)
Using this launcher to access the server implies acceptance of our community rules. The use of hacks, cheats, or any tools that provide an unfair advantage over other players is strictly prohibited.

5. PRIVACY
We collect minimal data (Minecraft UUID, system version) exclusively to allow access to the server and prevent access from sanctioned users (Bans). We do not sell your data to third parties.

6. NO WARRANTY
The software is provided "as-is" without warranties of any kind. We are not responsible for any data loss or technical issues arising from its use.
    ''',
    'privacy_title': 'Privacy Policy',
    'privacy_content': '''
This Privacy Policy describes the data practices of CrystalTidesSMP and its contributors ("we", "our", "us"). By using the Services, you are consenting to this Policy and the processing of your data.

1. NOT INTENDED FOR CHILDREN
The services are not intended for children. If you are not at least 13 years old, you may not use or access the services.

2. INFORMATION WE COLLECT
We collect minimal technical information required for the SMP server and web operation:
- Identifiers: Minecraft username, Minecraft UUID, IP address, and email address.
- Activity: Login logs, timestamps, and crash data.
- Hardware: OS version and basic specifications for optimization purposes.

3. USE OF INFORMATION
Technical data is used to:
- Provide access to the SMP server and manage your account on our website.
- Maintain security and prevent DDOS attacks.
- Enforce bans and community rules.
- Optimize launcher performance.

4. DATA SHARING
We share your Minecraft UUID with official Microsoft/Mojang authentication services to validate your account. We do not sell your personal information to third parties.

5. SECURITY
We implement reasonable security measures to protect your information, although no system on the Internet is 100% secure.

6. YOUR RIGHTS
You have the right to request the deletion of your access data by contacting our support team.
    ''',
    'btn_back': 'BACK',
  },
};

class _InstallerHomeState extends State<InstallerHome> {
  InstallerStep _currentStep = InstallerStep.welcome;
  double _progress = 0.0;
  String _statusKey = 'status_pre';
  String _selectedLanguage = 'Español';
  String _installPath = "";
  bool _acceptedTerms = false;
  String? _visibleDoc; // null, 'terms', 'privacy'

  String t(String key) => _i18n[_selectedLanguage]?[key] ?? key;

  @override
  void initState() {
    super.initState();
    _initPath();
  }

  Future<void> _initPath() async {
    final service = InstallationService();
    final path = await service.getInstallationPath();
    setState(() => _installPath = path);
  }

  Future<void> _startInstallation() async {
    setState(() {
      _currentStep = InstallerStep.installing;
      _statusKey = 'status_start';
    });

    try {
      final service = InstallationService();
      await service.install(
        onProgress: (progress) {
          setState(() {
            _progress = progress;
            if (progress < 0.3) {
              _statusKey = 'status_sync';
            } else if (progress < 0.9) {
              _statusKey = 'status_config';
            } else {
              _statusKey = 'status_opt';
            }
          });
        },
      );
      setState(() => _currentStep = InstallerStep.finish);
    } catch (e) {
      setState(() {
        _currentStep = InstallerStep.selectPath;
        _statusKey = 'status_pre';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF030308),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.04),
            width: 0.5,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF3498DB).withValues(alpha: 0.05),
              blurRadius: 40,
              spreadRadius: 5,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Column(
                children: [
                  _buildHeader(),
                  Expanded(child: _buildBody()),
                  _buildFooter(),
                ],
              ),
              if (_visibleDoc != null) _buildTermsOverlay(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTermsOverlay() {
    final title = _visibleDoc == 'terms'
        ? t('terms_title')
        : t('privacy_title');
    final content = _visibleDoc == 'terms'
        ? t('terms_content')
        : t('privacy_content');

    return Container(
      color: const Color(0xFF030308).withValues(alpha: 0.98),
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: SingleChildScrollView(
              child: Text(
                content,
                style: GoogleFonts.outfit(
                  color: Colors.white70,
                  fontSize: 13,
                  height: 1.6,
                ),
              ),
            ),
          ),
          const SizedBox(height: 30),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: () => setState(() => _visibleDoc = null),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3498DB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 40,
                  vertical: 15,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                t('btn_back'),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return GestureDetector(
      onPanStart: (_) => windowManager.startDragging(),
      child: Container(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Colors.white.withValues(alpha: 0.03)),
          ),
        ),
        child: Row(
          children: [
            Image.asset('assets/images/logo.png', width: 22, height: 22),
            const SizedBox(width: 12),
            Text(
              t('header'),
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
                color: Colors.white70,
              ),
            ),
            const Spacer(),
            _buildWindowButton(Icons.remove, () => windowManager.minimize()),
            const SizedBox(width: 10),
            _buildWindowButton(Icons.close, () => windowManager.close()),
          ],
        ),
      ),
    );
  }

  Widget _buildWindowButton(IconData icon, VoidCallback onPressed) {
    return IconButton(
      icon: Icon(icon, size: 18, color: Colors.white24),
      onPressed: onPressed,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(),
      hoverColor: Colors.white.withValues(alpha: 0.05),
      splashRadius: 20,
    );
  }

  Widget _buildBody() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 400),
      child: Container(
        key: ValueKey(_currentStep),
        child: _getContentForStep(),
      ),
    );
  }

  Widget _getContentForStep() {
    switch (_currentStep) {
      case InstallerStep.welcome:
        return _buildWelcomeBody();
      case InstallerStep.selectPath:
        return _buildPathBody();
      case InstallerStep.installing:
        return _buildInstallBody();
      case InstallerStep.finish:
        return _buildFinishBody();
    }
  }

  Widget _buildWelcomeBody() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          t('welcome'),
          style: GoogleFonts.outfit(
            fontSize: 20,
            color: Colors.white30,
            fontWeight: FontWeight.w300,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 30),
        Hero(
          tag: 'logo',
          child: Image.asset('assets/images/logo.png', width: 130, height: 130),
        ),
        const SizedBox(height: 30),
        Text(
          "CrystalTidesSMP Launcher",
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            letterSpacing: 2,
          ),
        ),
        Text(
          "INSTALLER",
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w300,
            color: Colors.white30,
            letterSpacing: 4,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          height: 1,
          width: 40,
          color: const Color(0xFF3498DB).withValues(alpha: 0.5),
        ),
      ],
    );
  }

  Widget _buildPathBody() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 60),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            t('destination'),
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.w500,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            t('dest_sub'),
            style: TextStyle(color: Colors.white30, fontSize: 13),
          ),
          const SizedBox(height: 30),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.02),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.folder_outlined,
                  size: 18,
                  color: Color(0xFF3498DB),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Text(
                    _installPath,
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 13,
                      fontFamily: 'monospace',
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 60),
          _buildTermsRow(),
        ],
      ),
    );
  }

  Widget _buildTermsRow() {
    return Row(
      children: [
        Theme(
          data: ThemeData(unselectedWidgetColor: Colors.white12),
          child: Checkbox(
            value: _acceptedTerms,
            activeColor: const Color(0xFF3498DB),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
            onChanged: (v) => setState(() => _acceptedTerms = v ?? false),
          ),
        ),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: GoogleFonts.outfit(color: Colors.white24, fontSize: 12),
              children: [
                TextSpan(text: t('terms_pre')),
                WidgetSpan(
                  child: GestureDetector(
                    onTap: () => setState(() => _visibleDoc = 'terms'),
                    child: Text(
                      t('terms_link'),
                      style: TextStyle(
                        color: const Color(0xFF3498DB).withValues(alpha: 0.8),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
                TextSpan(text: t('terms_and')),
                WidgetSpan(
                  child: GestureDetector(
                    onTap: () => setState(() => _visibleDoc = 'privacy'),
                    child: Text(
                      t('privacy_link'),
                      style: TextStyle(
                        color: const Color(0xFF3498DB).withValues(alpha: 0.8),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
                TextSpan(text: t('terms_post')),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInstallBody() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          t('configuring'),
          style: GoogleFonts.outfit(
            fontSize: 22,
            color: Colors.white,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 60),
        SizedBox(
          width: 100,
          height: 100,
          child: CircularProgressIndicator(
            value: _progress,
            strokeWidth: 2,
            backgroundColor: Colors.white.withValues(alpha: 0.05),
            color: const Color(0xFF3498DB),
          ),
        ),
        const SizedBox(height: 60),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 100),
          child: Column(
            children: [
              Text(
                t(_statusKey).toUpperCase(),
                style: GoogleFonts.outfit(
                  color: Colors.white24,
                  fontSize: 10,
                  letterSpacing: 2,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 15),
              Text(
                "${(_progress * 100).toInt()}%",
                style: GoogleFonts.outfit(
                  color: const Color(0xFF3498DB),
                  fontSize: 24,
                  fontWeight: FontWeight.w200,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFinishBody() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: const Color(0xFF27AE60).withValues(alpha: 0.2),
              width: 1,
            ),
          ),
          child: const Icon(Icons.done_all, size: 60, color: Color(0xFF27AE60)),
        ),
        const SizedBox(height: 40),
        Text(
          t('ready'),
          style: GoogleFonts.outfit(
            fontSize: 26,
            fontWeight: FontWeight.w500,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          t('finish_sub'),
          style: GoogleFonts.outfit(color: Colors.white24, fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 30),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.01),
        border: Border(
          top: BorderSide(color: Colors.white.withValues(alpha: 0.03)),
        ),
      ),
      child: Row(
        children: [
          if (_currentStep == InstallerStep.welcome ||
              _currentStep == InstallerStep.selectPath)
            _buildLanguageSelector(),
          const Spacer(),
          _buildActionButton(),
        ],
      ),
    );
  }

  Widget _buildLanguageSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedLanguage,
          dropdownColor: const Color(0xFF0F0F1A),
          icon: const Icon(Icons.unfold_more, color: Colors.white12, size: 16),
          items: ["Español", "English"]
              .map(
                (e) => DropdownMenuItem(
                  value: e,
                  child: Text(
                    e,
                    style: const TextStyle(fontSize: 12, color: Colors.white54),
                  ),
                ),
              )
              .toList(),
          onChanged: (v) => setState(() => _selectedLanguage = v!),
        ),
      ),
    );
  }

  Widget _buildActionButton() {
    String labelKey = "btn_continue";
    VoidCallback? onPressed;
    Color color = const Color(0xFF3498DB);
    bool isVisible = true;

    if (_currentStep == InstallerStep.welcome) {
      onPressed = () => setState(() => _currentStep = InstallerStep.selectPath);
    } else if (_currentStep == InstallerStep.selectPath) {
      labelKey = "btn_install";
      onPressed = _acceptedTerms ? _startInstallation : null;
    } else if (_currentStep == InstallerStep.installing) {
      isVisible = false;
    } else if (_currentStep == InstallerStep.finish) {
      labelKey = "btn_start";
      color = const Color(0xFF27AE60);
      onPressed = () async {
        await InstallationService().launchApp();
        await Future.delayed(const Duration(milliseconds: 200));
        await windowManager.close();
        exit(0);
      };
    }

    if (!isVisible) return const SizedBox.shrink();

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          disabledBackgroundColor: color.withValues(alpha: 0.15),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 45, vertical: 22),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        child: Text(
          t(labelKey),
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w700,
            fontSize: 13,
            letterSpacing: 2,
          ),
        ),
      ),
    );
  }
}
