# @letumfalx/phaser-plugin-debug

## 1.0.0

### Major Changes

- Scene Plugin Fix
  - moves `debug` package to `peerDependencies`, you need to also install it with this plugin
  - rename `SceneDebugPlugin` to `DebugScenePlugin` (deprecates `SceneDebugPlugin`)
  - debugger instance created on the scene plugin's boot method will be disabled by default
    - it will not be destroyed on `Phaser.Scenes.Events.SHUTDOWN`
    - it will now be enabled on `Phaser.Scenes.Events.START`
    - it will now be disabled on `Phaser.Scenes.Events.SHUTDOWN` and `Phaser.Scenes.Events.DESTROY`
    - removes `debugger.destroy()` call since it is deprecated

## 0.1.0

### Minor Changes

- initial release
