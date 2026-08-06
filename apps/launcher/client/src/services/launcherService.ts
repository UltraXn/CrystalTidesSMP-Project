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

interface VersionLibraryRule {
  action: string;
  os?: { name?: string };
}

interface VersionLibrary {
  rules?: VersionLibraryRule[];
  downloads?: { artifact?: { path?: string } };
  name?: string;
}

interface VersionManifest {
  mainClass?: string;
  libraries?: VersionLibrary[];
  minecraftArguments?: string;
  arguments?: { game?: unknown[] };
}

const isLibraryAllowed = (lib: VersionLibrary): boolean => {
  if (!lib.rules) return true;
  return !lib.rules.some((rule) => rule.action === "allow" && rule.os?.name === "osx");
};

const resolveLibraryPath = (lib: VersionLibrary): string | null => {
  if (lib.downloads?.artifact?.path) {
    return lib.downloads.artifact.path;
  }
  if (!lib.name) return null;

  const parts = lib.name.split(":");
  if (parts.length < 3) return null;

  const group = parts[0].replace(/\./g, "/");
  const artifact = parts[1];
  const version = parts[2];
  return `${group}/${artifact}/${version}/${artifact}-${version}.jar`;
};

const buildClasspath = (
  gameDirectory: string,
  versionId: string,
  versionData: VersionManifest
): string => {
  const classpathList: string[] = [`${gameDirectory}/versions/${versionId}/${versionId}.jar`];

  const libraries = versionData.libraries;
  if (!Array.isArray(libraries)) {
    return classpathList.map((p) => p.replace(/\//g, "\\")).join(";");
  }

  for (const lib of libraries) {
    if (!isLibraryAllowed(lib)) continue;
    const relPath = resolveLibraryPath(lib);
    if (relPath) {
      classpathList.push(`${gameDirectory}/libraries/${relPath}`);
    }
  }

  return classpathList.map((p) => p.replace(/\//g, "\\")).join(";");
};

const buildJvmArgs = (
  params: LaunchParams,
  gameDirectory: string,
  versionId: string,
  mainClass: string,
  cpString: string
): string[] => {
  const args: string[] = [`-Xmx${params.maxRam}M`, `-Xms${params.minRam}M`];

  if (params.javaArgs && params.javaArgs.trim().length > 0) {
    args.push(...params.javaArgs.trim().split(/\s+/));
  } else if (params.useOptimization) {
    args.push(
      "-XX:+UnlockExperimentalVMOptions",
      "-XX:+UseG1GC",
      "-XX:G1NewSizePercent=20",
      "-XX:G1ReservePercent=20",
      "-XX:MaxGCPauseMillis=50",
      "-XX:G1HeapRegionSize=32M",
      "-Djava.net.preferIPv4Stack=true"
    );
  } else {
    args.push("-XX:+UseG1GC");
  }

  const nativesPath = `${gameDirectory}/versions/${versionId}/natives`.replace(/\//g, "\\");
  args.push(`-Djava.library.path=${nativesPath}`, "-cp", cpString, mainClass);

  return args;
};

const buildGameArgs = (
  versionData: VersionManifest,
  params: LaunchParams,
  versionId: string,
  gameDirectory: string
): string[] => {
  const rawGameArgs: string[] = versionData.minecraftArguments
    ? versionData.minecraftArguments.split(" ")
    : ((versionData.arguments?.game || []).filter((arg): arg is string => typeof arg === "string"));

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

  return rawGameArgs.map((rawArg) => {
    let arg = rawArg;
    for (const [key, val] of Object.entries(placeholders)) {
      const pattern = "${" + key + "}";
      arg = arg.split(pattern).join(val);
    }
    return arg;
  });
};

const resolveVersionId = (params: LaunchParams): string => {
  if (params.loaderType && params.loaderVersion) {
    if (params.loaderType === "neoforge") {
      return `neoforge-${params.loaderVersion}`;
    }
    if (params.loaderType === "fabric") {
      return `fabric-loader-${params.loaderVersion}-${params.mcVersion}`;
    }
  }
  return params.mcVersion;
};

const readVersionManifest = async (
  gameDirectory: string,
  versionId: string,
  mcVersion: string
): Promise<VersionManifest> => {
  const versionJsonPath = `${gameDirectory}/versions/${versionId}/${versionId}.json`;
  try {
    const versionJsonContent = await invoke<string>("read_text_file", { path: versionJsonPath });
    return JSON.parse(versionJsonContent);
  } catch {
    if (versionId !== mcVersion) {
      const vanillaJsonPath = `${gameDirectory}/versions/${mcVersion}/${mcVersion}.json`;
      const vanillaContent = await invoke<string>("read_text_file", { path: vanillaJsonPath });
      return JSON.parse(vanillaContent);
    }
    throw new Error(`No se encontró el manifiesto de versión en: ${versionJsonPath}`);
  }
};

export const launchGame = async (
  params: LaunchParams,
  onProgress?: (status: string, progress: number) => void
): Promise<number> => {
  try {
    onProgress?.("Resolviendo directorios del juego...", 0.05);

    const homeDir = await invoke<string | null>("get_home_dir");
    if (!homeDir) throw new Error("No se pudo obtener el directorio del usuario.");

    const normalizedHome = homeDir.replace(/\\/g, "/");
    const gameDirectory = params.gameDir || `${normalizedHome}/.crystaltides`;

    onProgress?.("Comprobando entorno de Java...", 0.1);
    const requiredJavaVersion = getJavaVersionForMinecraft(params.mcVersion);
    const runtimesDir = `${normalizedHome}/.crystaltides/runtimes`;
    const javaPath = params.javaPath || (await ensureJava(requiredJavaVersion, runtimesDir));

    onProgress?.("Cargando perfil de Minecraft...", 0.2);
    const versionId = resolveVersionId(params);
    const versionData = await readVersionManifest(gameDirectory, versionId, params.mcVersion);
    const mainClass = versionData.mainClass || "net.minecraft.client.main.Main";

    onProgress?.("Construyendo argumentos de ejecución...", 0.5);
    const cpString = buildClasspath(gameDirectory, versionId, versionData);
    const jvmArgs = buildJvmArgs(params, gameDirectory, versionId, mainClass, cpString);
    const gameArgs = buildGameArgs(versionData, params, versionId, gameDirectory);
    const fullArgs = [...jvmArgs, ...gameArgs];

    onProgress?.("Iniciando Minecraft...", 0.9);
    console.log(`Executing java at ${javaPath} with args:`, fullArgs);

    const pid = await invoke<number>("launch_minecraft", {
      javaPath,
      args: fullArgs,
      gameDir: gameDirectory,
    });

    onProgress?.("¡Juego iniciado con éxito!", 1.0);
    return pid;
  } catch (err) {
    console.error("Failed to launch game:", err);
    throw err;
  }
};

export const killGame = async (): Promise<boolean> => {
  try {
    return await invoke<boolean>("kill_minecraft");
  } catch (err) {
    console.error("Failed to kill game process:", err);
    return false;
  }
};

export const checkGameRunning = async (): Promise<boolean> => {
  try {
    return await invoke<boolean>("is_game_running");
  } catch {
    return false;
  }
};
