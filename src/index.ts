import path from "path";
import * as vortexApi from "vortex-api"; // eslint-disable-line import/no-extraneous-dependencies

// Our stuff
import { EPICAPP_ID, GAME_ID, GOGAPP_ID, STEAMAPP_ID } from "./index.metadata";
import { wrapTestSupported, wrapInstall, internalPipelineInstaller } from "./installers";
import { VortexExtensionContext, VortexGameStoreEntry } from "./vortex-wrapper";

const moddingTools = [
  {
    id: "CSVMerge",
    name: "CSVMerge",
    executable: () => path.join("csvmerge", "CSVMerge.cmd"),
    requiredFiles: [
      path.join("csvmerge", "CSVMerge.cmd"),
      path.join("csvmerge", "wolvenkitcli", "WolvenKit.CLI.exe"),
    ],
    shell: true,
    relative: true,
  },
];

export const findGame = () =>
  vortexApi.util.GameStoreHelper.findByAppId([STEAMAPP_ID, GOGAPP_ID, EPICAPP_ID]).then(
    (game: VortexGameStoreEntry) => game.gamePath,
  );

const requiresGoGLauncher = () =>
  vortexApi.util.GameStoreHelper.isGameInstalled(GOGAPP_ID, "gog").then((gog) =>
    gog ? { launcher: "gog", addInfo: GOGAPP_ID } : undefined,
  );

const prepareForModding = (discovery) =>
  vortexApi.fs.readdirAsync(path.join(discovery.path));

// This is the main function Vortex will run when detecting the game extension.
const main = (vortex: VortexExtensionContext) => {
  vortex.registerGame({
    id: GAME_ID,
    name: "Cyberpunk 2077",
    mergeMods: true,
    queryPath: findGame,
    queryModPath: () => "",
    logo: "gameart.png",
    executable: () => "bin/x64/Cyberpunk2077.exe",
    requiredFiles: ["bin/x64/Cyberpunk2077.exe"],
    supportedTools: moddingTools,
    compatible: {
      symlinks: false,
    },
    requiresLauncher: requiresGoGLauncher,
    setup: prepareForModding,
    environment: {
      SteamAPPId: STEAMAPP_ID,
    },
    details: {
      steamAppId: STEAMAPP_ID,
      gogAppId: GOGAPP_ID,
      epicAppId: EPICAPP_ID,
    },
  });

  vortex.registerInstaller(
    internalPipelineInstaller.id,
    internalPipelineInstaller.priority,
    wrapTestSupported(vortex, vortexApi, internalPipelineInstaller),
    wrapInstall(vortex, vortexApi, internalPipelineInstaller),
  );

  return true;
};

export default main;
