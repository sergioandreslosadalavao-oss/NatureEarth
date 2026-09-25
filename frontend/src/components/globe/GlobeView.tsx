import { useEffect, useRef, useState } from 'react'
import Globe from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import { categoryMeta } from '../../lib/categories'
import type { GlobeMarker } from '../../types/api'

/**
 * Textura terrestre oscura (luces de ciudad) servida por el CDN de three-globe.
 * Se precarga antes de asignarla: si el CDN falla, el globo se dibuja sin
 * textura en vez de quedarse negro.
 */
const EARTH_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
const ESPACIO = '#050810'

/** Altitud de cámara al seleccionar una especie (SRS 6.1: animación de vuelo). */
const ALTITUD_VUELO = 1.5
const DURACION_VUELO_MS = 1500

/**
 * globe.gl tipa los accesores como `ObjAccessor<T> = T | string | ((obj: object) => T)`,
 * una unión que TypeScript no puede usar para inferir el parámetro. Se
 * declara el parámetro como `object` y se estrecha con este helper: es el
 * único `as` puntual que hace falta en la integración con la librería.
 */
const asMarker = (data: object): GlobeMarker => data as GlobeMarker

/** Petición de vuelo: cada cambio de `token` dispara una animación nueva. */
export interface GlobeFocus {
  lat: number
  lng: number
  token: number
}

interface GlobeViewProps {
  markers: GlobeMarker[]
  selectedId: string | null
  focus: GlobeFocus | null
  onSelectMarker: (marker: GlobeMarker) => void
  /** Click en el espacio vacío del globo: cierra el detalle abierto. */
  onGlobeBackgroundClick?: () => void
  onGlobeReady?: () => void
}

export default function GlobeView({
  markers,
  selectedId,
  focus,
  onSelectMarker,
  onGlobeBackgroundClick,
  onGlobeReady,
}: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  // Los callbacks viven en refs para que la instancia del globo se cree una
  // sola vez y aun así reciba siempre la versión más reciente de las props.
  const onSelectRef = useRef(onSelectMarker)
  const onReadyRef = useRef(onGlobeReady)
  const onBackgroundRef = useRef(onGlobeBackgroundClick)

  useEffect(() => {
    onSelectRef.current = onSelectMarker
    onReadyRef.current = onGlobeReady
    onBackgroundRef.current = onGlobeBackgroundClick
  })

  const [hovered, setHovered] = useState<{ marker: GlobeMarker; x: number; y: number } | null>(null)

  // --- Creación del globo (una sola vez) ---------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const globe = new Globe(container)
      .backgroundColor(ESPACIO)
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor('#2f5f9e')
      .atmosphereAltitude(0.16)
      .pointsData([])
      .pointsMerge(false)
      .pointLat((d: object) => asMarker(d).lat)
      .pointLng((d: object) => asMarker(d).lng)
      .pointColor((d: object) => categoryMeta(asMarker(d).category).hex)
      .pointAltitude(0.012)
      .pointRadius(0.55)
      .pointResolution(12)
      .ringsData([])
      .ringLat((d: object) => asMarker(d).lat)
      .ringLng((d: object) => asMarker(d).lng)
      .ringColor((d: object) => categoryMeta(asMarker(d).category).glow)
      .ringMaxRadius(4.5)
      .ringPropagationSpeed(2.2)
      .ringRepeatPeriod(900)
      .labelsData([])
      .labelLat((d: object) => asMarker(d).lat)
      .labelLng((d: object) => asMarker(d).lng)
      .labelText((d: object) => asMarker(d).commonNameEs)
      .labelColor(() => 'rgba(232, 238, 244, 0.85)')
      .labelSize(1.1)
      .labelAltitude(0.06)
      .labelDotOrientation('bottom')
      .labelIncludeDot(false)
      .onPointClick((point: object) => {
        onSelectRef.current(asMarker(point))
      })
      // Click en zona vacía: `onGlobeClick` y `onPointClick` son excluyentes
      // en globe.gl, así que este caso nunca pisa la selección de un marcador.
      .onGlobeClick(() => {
        onBackgroundRef.current?.()
      })
      .onPointHover((point: object | null) => {
        if (!point) {
          setHovered(null)
          return
        }
        const marker = asMarker(point)
        const { x, y } = globe.getScreenCoords(marker.lat, marker.lng)
        setHovered({ marker, x, y })
      })
      // Encuadre inicial: NANEP, donde están la mayoría de los puntos sembrados.
      .pointOfView({ lat: 6, lng: -74, altitude: 2.1 }, 0)

    // Rotación automática lenta (SRS 6.1). El damping ya viene activado.
    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.35

    globeRef.current = globe
    globe.onGlobeReady(() => onReadyRef.current?.())

    // Textura: se asigna sólo si la descarga funciona.
    const texture = new Image()
    texture.onload = () => {
      globeRef.current?.globeImageUrl(EARTH_TEXTURE)
    }
    texture.src = EARTH_TEXTURE

    return () => {
      globeRef.current = null
      globe._destructor()
    }
  }, [])

  // --- Tamaño fluido del lienzo -------------------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        globeRef.current?.width(width).height(height)
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // --- Datos reales de marcadores -----------------------------------------
  useEffect(() => {
    globeRef.current?.pointsData(markers)
  }, [markers])

  // --- Anillo de pulso en la especie seleccionada --------------------------
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const selected = markers.find((marker) => marker.speciesId === selectedId)
    globe.ringsData(selected ? [selected] : [])
  }, [markers, selectedId])

  /**
   * Con una especie seleccionada la rotación automática se detiene: si
   * siguiera girando, el marcador se iría de la vista mientras el usuario
   * lee la ficha. Al cerrar el detalle, el globo retoma su rotación.
   */
  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = selectedId == null
  }, [selectedId])

  // --- Etiqueta persistente de la especie seleccionada ---------------------
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const selected = markers.find((marker) => marker.speciesId === selectedId)
    globe.labelsData(selected ? [selected] : [])
  }, [markers, selectedId])

  // --- Vuelo del globo hacia una coordenada (SRS 6.1) ----------------------
  useEffect(() => {
    if (!focus) return
    globeRef.current?.pointOfView(
      { lat: focus.lat, lng: focus.lng, altitude: ALTITUD_VUELO },
      DURACION_VUELO_MS,
    )
  }, [focus])

  return (
    <>
      <div ref={containerRef} className="lienzo-globo" aria-label="Globo terráqueo interactivo" />
      {hovered ? (
        <div
          className="tooltip-marcador absolute z-10 rounded-lg border border-borde bg-superficie/95 px-3 py-1.5 text-center shadow-xl backdrop-blur"
          style={{ left: hovered.x, top: hovered.y }}
        >
          <p className="text-xs font-semibold text-texto">{hovered.marker.commonNameEs}</p>
          <p className="cientifico text-[11px] text-texto-suave">{hovered.marker.scientificName}</p>
          <p className="text-[10px] text-texto-suave/80">{hovered.marker.placeName}</p>
        </div>
      ) : null}
    </>
  )
}
