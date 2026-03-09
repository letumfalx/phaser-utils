# @letumfalx/phaser-plugin-socketio

## 0.0.2

### Patch Changes

- cdee166: EventBridge overhaul to fix status not updating on reconnection
  - `EventBridge`
    - will manually track socket status through event
    - `socket` and initial `status` will be now passed on `init()` instead of `constructor()`
    - `socket` and `status` will be unset when `destroy()` is called
  - deprecate exported `SOCKET_STATUS_CHECK_EVENT_NAMES` constant since it is not used internally anymore

## 0.0.1

### Patch Changes

- 6216c4a: initial release
