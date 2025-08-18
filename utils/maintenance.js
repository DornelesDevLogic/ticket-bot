let _enabled = false;

export function enable() {
  console.log("Modo manutenção ligado.")
  _enabled = true;
}

export function disable() {
  console.log("Modo manutenção desligado.")
  _enabled = false;
}

export function isEnabled() {
  return _enabled;
}
