// 高德地图 API 类型声明
declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions)
    setZoom(zoom: number): void
    setCenter(lnglat: [number, number]): void
    add(marker: Marker): void
    clearMap(): void
    destroy(): void
    on(event: string, handler: (e: any) => void): void
  }

  interface MapOptions {
    zoom?: number
    center?: [number, number]
    mapStyle?: string
    viewMode?: string
  }

  class Marker {
    constructor(options?: MarkerOptions)
    setPosition(lnglat: [number, number]): void
    setTitle(title: string): void
    on(event: string, handler: (e: any) => void): void
    getPosition(): LngLat
  }

  interface MarkerOptions {
    position?: [number, number]
    title?: string
    content?: HTMLElement | string
    offset?: Pixel
    extData?: any
  }

  class Pixel {
    constructor(x: number, y: number)
  }

  class LngLat {
    constructor(lng: number, lat: number)
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions)
    open(map: Map, position: LngLat): void
    close(): void
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement
    offset?: Pixel
  }
}

interface Window {
  AMap: typeof AMap
}
