export function setupComponent(player: SupRuntime.Player, component: any, config: any) {
  component.setText(config.text);
  component.setOptions({ alignment: config.alignment, verticalAlignment: config.verticalAlignment, size: config.size, color: config.color, opacity: config.opacity });
  if (config.fontAssetId != null) {
    let font = player.getOuterAsset(config.fontAssetId).__inner;
    component.setFont(font);
  }
}
