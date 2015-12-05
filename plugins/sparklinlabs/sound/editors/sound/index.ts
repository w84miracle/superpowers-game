import SoundAsset from "../../data/SoundAsset";

/* tslint:disable */
let PerfectResize = require("perfect-resize");
/* tslint:enable */

let data: {
  projectClient: SupClient.ProjectClient;
  asset: SoundAsset;
} = {} as any;

let ui: { streamingSelect?: HTMLSelectElement; audioElt?: HTMLAudioElement; } = {};
let socket: SocketIOClient.Socket = null;

function start() {
  socket = SupClient.connect(SupClient.query.project);
  socket.on("connect", onConnected);
  socket.on("disconnect", SupClient.onDisconnected);
  SupClient.setupHotkeys();

  // Main
  ui.audioElt = <HTMLAudioElement>document.querySelector("audio");

  // Upload
  let fileSelect = <HTMLInputElement>document.querySelector("input.file-select");
  fileSelect.addEventListener("change", onFileSelectChange);
  document.querySelector("button.upload").addEventListener("click", () => { fileSelect.click(); } );
  document.querySelector("button.download").addEventListener("click", onDownloadSound);

  // Sidebar
  ui.streamingSelect = <HTMLSelectElement>document.querySelector(".property-streaming");
  ui.streamingSelect.addEventListener("change", (event) => {
    socket.emit("edit:assets", SupClient.query.asset, "setProperty", "streaming", ui.streamingSelect.value === "true", (err: string) => {
      if (err != null) { alert(err); return; }
    });
  });
}

// Network callbacks
let onAssetCommands: any = {};

function onConnected() {
  data.projectClient = new SupClient.ProjectClient(socket);

  let soundSubscriber = {
    onAssetReceived,
    onAssetEdited,
    onAssetTrashed: SupClient.onAssetTrashed
  };

  data.projectClient.subAsset(SupClient.query.asset, "sound", soundSubscriber);
}

function onAssetReceived(err: string, asset: SoundAsset) {
  data.asset = asset;

  setupSound();
  setupProperty("streaming", data.asset.pub.streaming);
}

function onAssetEdited(id: string, command: string, ...args: any[]) {
  if (onAssetCommands[command] != null) onAssetCommands[command].apply(data.asset, args);
}

// User interface
let objectURL: string;

function onFileSelectChange(event: any) {
  if (event.target.files.length === 0) return;

  let reader = new FileReader();
  reader.onload = (event) => {
    socket.emit("edit:assets", SupClient.query.asset, "upload", reader.result, (err: string) => {
      if (err != null) { alert(err); return; }
    });
  };
  reader.readAsArrayBuffer(event.target.files[0]);
  event.target.parentElement.reset();
}

function onDownloadSound() {
  let options = {
    initialValue: SupClient.i18n.t("soundEditor:sidebar.settings.sound.file.download.defaultName"),
    validationLabel: SupClient.i18n.t("common:actions.download")
  };

  /* tslint:disable:no-unused-expression */
  new SupClient.dialogs.PromptDialog(SupClient.i18n.t("soundEditor:sidebar.settings.sound.file.download.prompt"), options, (name) => {
    /* tslint:enable:no-unused-expression */
    if (name == null) return;

    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = objectURL;

    // Not yet supported in IE and Safari (http://caniuse.com/#feat=download)
    (<any>a).download = name;
    a.click();
    document.body.removeChild(a);
  });
}

function setupSound() {
  if (objectURL != null) URL.revokeObjectURL(objectURL);

  let typedArray = new Uint8Array(data.asset.pub.sound);
  let blob = new Blob([ typedArray ], {type: "audio"});
  objectURL = URL.createObjectURL(blob);
  ui.audioElt.src = objectURL;
}

function setupProperty(path: string, value: any) {
  switch(path) {
    case "streaming": ui.streamingSelect.value = value; break;
  }
}

onAssetCommands.upload = setupSound;
onAssetCommands.setProperty = setupProperty;

// Start
SupClient.i18n.load([{ root: `${window.location.pathname}/../..`, name: "soundEditor" }], start);
