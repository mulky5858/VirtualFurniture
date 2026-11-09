// DEBUG 面板：后处理开关（仅测试模式显示）
var debugPanelExpanded = 1

function setPostAAEnabled (enabled) {
  var on = enabled ? 1 : 0
  if (typeof useFXAA !== 'undefined') useFXAA = on
  if (typeof useMSAA !== 'undefined') useMSAA = on
  if (typeof rebuildPostBuffers === 'function') rebuildPostBuffers()
}

function syncDebugPanelFromFlags () {
  var ao = document.getElementById('debugToggleAO')
  var contact = document.getElementById('debugToggleContact')
  var aa = document.getElementById('debugToggleAA')
  if (ao && typeof useAO !== 'undefined') ao.checked = !!useAO
  if (contact && typeof useContactShadow !== 'undefined') contact.checked = !!useContactShadow
  if (aa) {
    var fxaaOn = typeof useFXAA === 'undefined' || !!useFXAA
    var msaaOn = typeof useMSAA === 'undefined' || !!useMSAA
    aa.checked = !!(fxaaOn || msaaOn)
  }
}

function updateDebugPanelVisibility () {
  var root = document.getElementById('debugPanelRoot')
  if (!root) return
  var show = typeof testmode !== 'undefined' && !!testmode
  root.style.display = show ? 'block' : 'none'
  if (show) {
    syncDebugPanelFromFlags()
    var panel = document.getElementById('debugPanel')
    var btn = document.getElementById('debugPanelToggle')
    if (panel) panel.style.display = debugPanelExpanded ? 'block' : 'none'
    if (btn) btn.textContent = debugPanelExpanded ? 'DEBUG ▾' : 'DEBUG ▸'
  }
}

function onDebugToggleAO (checked) {
  if (typeof useAO !== 'undefined') useAO = checked ? 1 : 0
}

function onDebugToggleContact (checked) {
  if (typeof useContactShadow !== 'undefined') useContactShadow = checked ? 1 : 0
}

function onDebugToggleAA (checked) {
  setPostAAEnabled(checked)
}

function toggleDebugPanel () {
  debugPanelExpanded = debugPanelExpanded ? 0 : 1
  var panel = document.getElementById('debugPanel')
  var btn = document.getElementById('debugPanelToggle')
  if (panel) panel.style.display = debugPanelExpanded ? 'block' : 'none'
  if (btn) btn.textContent = debugPanelExpanded ? 'DEBUG ▾' : 'DEBUG ▸'
}

function initDebugPanel () {
  syncDebugPanelFromFlags()
  updateDebugPanelVisibility()
  var panel = document.getElementById('debugPanel')
  if (panel) {
    panel.onmousedown = function (e) {
      if (e && e.stopPropagation) e.stopPropagation()
    }
    panel.onclick = function (e) {
      if (e && e.stopPropagation) e.stopPropagation()
    }
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugPanel)
  } else {
    initDebugPanel()
  }
}
