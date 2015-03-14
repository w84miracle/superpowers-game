module Sup {
  export class Camera extends ActorComponent {
    constructor(actor) {
      super(actor);
      this.__inner = new SupEngine.componentPlugins.Camera(this.actor.__inner);
      this.__inner.__outer = this;
      this.actor.camera = this;
    }
    destroy() {
      this.actor.camera = null;
      super.destroy();
    }

    setOrthographicMode(enabled) {
      this.__inner.setOrthographicMode(enabled);
      return this;
    }
    getOrthographicMode() { return this.__inner.isOrthographic; }
    setOrthographicScale(scale) {
      this.__inner.setOrthographicScale(scale);
      return this;
    }
    getOrthographicScale() { return this.__inner.orthographicScale; }

    setFOV(fov) {
      this.__inner.setFOV(fov);
      return this;
    }
    getFOV() { return this.__inner.fov; }
    getWidthToHeightRatio() { return this.__inner.cachedRatio; }

    setViewport(x, y, width, height) { this.__inner.setViewport(x, y, width, height); return this; }
    getViewport() {
      return {
        x: this.__inner.viewport.x,
        y: this.__inner.viewport.y,
        width: this.__inner.viewport.width,
        height: this.__inner.viewport.height
      };
    }
  }
}
