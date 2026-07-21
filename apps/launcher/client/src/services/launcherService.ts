import { invoke } from "@tauri-apps/api/core";
import { ensureJava, getJavaVersionForMinecraft } from "./javaService";

export interface LaunchParams {
  username: string;
  uuid: string;
  accessToken: string;
  mcVersion: string;
  loaderType: string;
  loaderVersion: string;
  minRam: number;
  maxRam: number;
  useOptimization: boolean;
  gameDir?: string;
  javaArgs?: string;
  javaPath?: string;
}

export const launchGame = async (
  params: LaunchParams,
  onProgress?: (status: string, progress: number) => void
): Promise<void> => {
  try {
    onProgress?.("Resolviendo directorios del juego...", 0.05);

    const homeDir: string | null = await invoke("get_home_dir");
    if (!homeDir) throw new Error("No se pudo obtener el directorio del usuario.");

    const normalizedHome = homeDir.replace(/\\/g, "/");
    
    // Use the mods path as default if not specified (~/.crystaltides)
    const gameDirectory = params.gameDir || `${normalizedHome}/.crystaltides`;
    
    // 1. Resolve required Java major version and ensure it exists
    onProgress?.("Comprobando entorno de Java...", 0.1);
    const requiredJavaVersion = getJavaVersionForMinecraft(params.mcVersion);
    const runtimesDir = `${normalizedHome}/.crystaltides/runtimes`;
    // Use custom javaPath if specified, otherwise ensure/install adoptium java
    const javaPath = params.javaPath || await ensureJava(requiredJavaVersion, runtimesDir);

    // 2. Read version JSON to get classpath and main class
    onProgress?.("Cargando perfil de Minecraft...", 0.2);
    
    // Resolve version ID (Vanilla vs Modded)
    let versionId = params.mcVersion;
    if (params.loaderType && params.loaderVersion) {
      if (params.loaderType === "neoforge") {
        versionId = `neoforge-${params.loaderVersion}`;
      } else if (params.loaderType === "fabric") {
        versionId = `fabric-loader-${params.loaderVersion}-${params.mcVersion}`;
      }
    }

    const versionJsonPath = `${gameDirectory}/versions/${versionId}/${versionId}.json`;
    let versionJsonContent: string;
    try {
      versionJsonContent = await invoke("read_text_file", { path: versionJsonPath });
    } catch {
      // If modded json is missing, check vanilla
      if (versionId !== params.mcVersion) {
        versionId = params.mcVersion;
        const vanillaJsonPath = `${gameDirectory}/versions/${versionId}/${versionId}.json`;
        versionJsonContent = await invoke("read_text_file", { path: vanillaJsonPath });
      } else {
        throw new Error(`No se encontró el manifiesto de versión en: ${versionJsonPath}`);
      }
    }

    const versionData = JSON.parse(versionJsonContent);
    const mainClass = versionData.mainClass || "net.minecraft.client.main.Main";

    // 3. Assemble classpath
    onProgress?.("Construyendo argumentos de ejecución...", 0.5);
    const classpathList: string[] = [];

    // Add version jar
    classpathList.push(`${gameDirectory}/versions/${versionId}/${versionId}.jar`);

    // Parse libraries from JSON
    if (versionData.libraries && Array.isArray(versionData.libraries)) {
      for (const lib of versionData.libraries) {
        // Simple rules check
        if (lib.rules) {
          let allow = true;
          for (const rule of lib.rules) {
            if (rule.action === "allow" && rule.os?.name === "osx") allow = false; // Skip mac specific libraries on Windows
          }
          if (!allow) continue;
        }

        if (lib.downloads?.artifact?.path) {
          classpathList.push(`${gameDirectory}/libraries/${lib.downloads.artifact.path}`);
        } else if (lib.name) {
          const parts = lib.name.split(":");
          if (parts.length >= 3) {
            const group = parts[0].replace(/\./g, "/");
            const artifact = parts[1];
            const version = parts[2];
            const mavenPath = `${group}/${artifact}/${version}/${artifact}-${version}.jar`;
            classpathList.push(`${gameDirectory}/libraries/${mavenPath}`);
          }
        }
      }
    }

    // Join classpath
    const cpSeparator = ";"; // Windows
    const cpString = classpathList.map((p) => p.replace(/\//g, "\\")).join(cpSeparator);

    // 4. Build Java Arguments
    const args: string[] = [];

    // JVM Args (RAM & GC)
    args.push(`-Xmx${params.maxRam}M`);
    args.push(`-Xms${params.minRam}M`);

    if (params.javaArgs && params.javaArgs.trim().length > 0) {
      const customArgs = params.javaArgs.trim().split(/\s+/);
      args.push(...customArgs);
    } else {
      if (params.useOptimization) {
        args.push("-XX:+UnlockExperimentalVMOptions");
        args.push("-XX:+UseG1GC");
        args.push("-XX:G1NewSizePercent=20");
        args.push("-XX:G1ReservePercent=20");
        args.push("-XX:MaxGCPauseMillis=50");
        args.push("-XX:G1HeapRegionSize=32M");
        args.push("-Djava.net.preferIPv4Stack=true");
      } else {
        args.push("-XX:+UseG1GC");
      }
    }

    // Natives path override
    const nativesPath = `${gameDirectory}/versions/${versionId}/natives`.replace(/\//g, "\\");
    args.push(`-Djava.library.path=${nativesPath}`);

    // Classpath definition
    args.push("-cp");
    args.push(cpString);

    // Main class
    args.push(mainClass);

    // Minecraft Game Arguments (Replace Placeholders)
    const gameArgs: string[] = [];
    const rawGameArgs = versionData.minecraftArguments
      ? versionData.minecraftArguments.split(" ")
      : (versionData.arguments?.game || []).filter((arg: any) => typeof arg === "string");

    // Push standard Minecraft arguments with substitutions
    const placeholders: Record<string, string> = {
      auth_player_name: params.username,
      version_name: versionId,
      game_directory: gameDirectory,
      assets_root: `${gameDirectory}/assets`,
      assets_index_name: params.mcVersion,
      auth_uuid: params.uuid,
      auth_access_token: params.accessToken,
      user_type: "legacy",
      version_type: "release",
      clientid: params.uuid,
      auth_xuid: params.uuid,
    };

    for (const rawArg of rawGameArgs) {
      let arg = rawArg;
      for (const [key, val] of Object.entries(placeholders)) {
        arg = arg.replace(new RegExp(`\\\$\\\{${key}\\\}`, "g"), val);
      }
      gameArgs.push(arg);
    }

    args.push(...gameArgs);

    // 5. Invoke native process launcher command
    onProgress?.("Iniciando Minecraft...", 0.9);
    console.log(`Executing java at ${javaPath} with args:`, args);

    await invoke("launch_minecraft", {
      javaPath,
      args,
      gameDir: gameDirectory,
    });

    onProgress?.("¡Juego iniciado con éxito!", 1.0);
  } catch (err) {
    console.error("Failed to launch game:", err);
    throw err;
  }
};
