import { useEffect, useRef, useState } from 'react'

function CursorGlow() {
  const glowRef = useRef(null)
  const accentRef = useRef(null)
  const coreRef = useRef(null)
  const sparkleOneRef = useRef(null)
  const sparkleTwoRef = useRef(null)
  const frameRef = useRef(0)
  const hideTimerRef = useRef(0)
  const positionRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    ready: false,
  })
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncEnabled = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches)
    }

    syncEnabled()

    if (finePointer.addEventListener) {
      finePointer.addEventListener('change', syncEnabled)
      reducedMotion.addEventListener('change', syncEnabled)
    } else {
      finePointer.addListener(syncEnabled)
      reducedMotion.addListener(syncEnabled)
    }

    return () => {
      if (finePointer.removeEventListener) {
        finePointer.removeEventListener('change', syncEnabled)
        reducedMotion.removeEventListener('change', syncEnabled)
      } else {
        finePointer.removeListener(syncEnabled)
        reducedMotion.removeListener(syncEnabled)
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const glow = glowRef.current
    const accent = accentRef.current
    const core = coreRef.current
    const sparkleOne = sparkleOneRef.current
    const sparkleTwo = sparkleTwoRef.current
    if (!glow || !accent || !core || !sparkleOne || !sparkleTwo) return undefined

    const render = () => {
      const state = positionRef.current

      if (!state.ready) {
        frameRef.current = window.requestAnimationFrame(render)
        return
      }

      state.x += (state.tx - state.x) * 0.14
      state.y += (state.ty - state.y) * 0.14
      const t = performance.now() / 550
      const sparkleOneX = state.x + 18 + Math.sin(t) * 4
      const sparkleOneY = state.y - 16 + Math.cos(t * 1.1) * 3
      const sparkleTwoX = state.x - 14 + Math.cos(t * 1.25) * 5
      const sparkleTwoY = state.y + 12 + Math.sin(t * 1.45) * 4

      glow.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`
      accent.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`
      core.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`
      sparkleOne.style.transform = `translate3d(${sparkleOneX}px, ${sparkleOneY}px, 0) translate(-50%, -50%)`
      sparkleTwo.style.transform = `translate3d(${sparkleTwoX}px, ${sparkleTwoY}px, 0) translate(-50%, -50%)`

      frameRef.current = window.requestAnimationFrame(render)
    }

    const reveal = () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
      glow.style.opacity = '1'
      accent.style.opacity = '1'
      core.style.opacity = '1'
      sparkleOne.style.opacity = '1'
      sparkleTwo.style.opacity = '1'
    }

    const hide = () => {
      hideTimerRef.current = window.setTimeout(() => {
        glow.style.opacity = '0'
        accent.style.opacity = '0'
        core.style.opacity = '0'
        sparkleOne.style.opacity = '0'
        sparkleTwo.style.opacity = '0'
      }, 60)
    }

    const onMove = (event) => {
      const state = positionRef.current
      state.tx = event.clientX
      state.ty = event.clientY
      if (!state.ready) {
        state.x = event.clientX
        state.y = event.clientY
        state.ready = true
      }
      reveal()
    }

    const onLeave = () => hide()

    frameRef.current = window.requestAnimationFrame(render)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', reveal, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', reveal)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.18)_0%,rgba(201,162,74,0.12)_22%,rgba(201,162,74,0.05)_44%,rgba(201,162,74,0)_72%)] opacity-0 blur-3xl transition-opacity duration-300"
      />
      <div
        ref={accentRef}
        className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(90,58,30,0.16)_0%,rgba(90,58,30,0.08)_35%,rgba(90,58,30,0)_74%)] opacity-0 blur-2xl transition-opacity duration-300"
      />
      <div
        ref={coreRef}
        className="absolute left-0 top-0 h-5 w-5 rounded-full bg-[radial-gradient(circle,rgba(255,251,242,0.96)_0%,rgba(225,193,133,0.82)_34%,rgba(201,162,74,0.12)_68%,rgba(201,162,74,0)_100%)] opacity-0 blur-[1px] transition-opacity duration-300"
      />
      <div
        ref={sparkleOneRef}
        className="absolute left-0 top-0 select-none text-[18px] leading-none text-[#c9a24a] opacity-0 drop-shadow-[0_0_10px_rgba(201,162,74,0.45)] transition-opacity duration-300 animate-pulse"
      >
        ✦
      </div>
      <div
        ref={sparkleTwoRef}
        className="absolute left-0 top-0 select-none text-[12px] leading-none text-[#f7e5b6] opacity-0 drop-shadow-[0_0_8px_rgba(247,229,182,0.45)] transition-opacity duration-300 animate-pulse"
        style={{ animationDelay: '180ms' }}
      >
        ✧
      </div>
    </div>
  )
}

export default CursorGlow
