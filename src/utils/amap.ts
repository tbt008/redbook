let amapLoadingPromise: Promise<void> | null = null

const AMAP_KEY = 'a7b3327e03aded1d1c991632d50f0d51'
const AMAP_SECURITY_CODE = '1b5870e9227ca6f29ae1d37bee644626'
const AMAP_PLUGINS = ['AMap.Tooltip', 'AMap.Geocoder']
const SCRIPT_TIMEOUT = 12000
const MAX_RETRY_COUNT = 2

const buildAMapScriptUrl = (retryIndex: number) => {
  const params = new URLSearchParams({
    v: '2.0',
    key: AMAP_KEY,
    plugin: AMAP_PLUGINS.join(','),
    t: String(Date.now() + retryIndex)
  })
  return `https://webapi.amap.com/maps?${params.toString()}`
}

const removeLoaderScript = () => {
  document.querySelectorAll('script[data-amap-loader="true"]').forEach((script) => script.remove())
}

const loadScriptOnce = (retryIndex: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    let settled = false
    let timeoutId = 0

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      script.onload = null
      script.onerror = null
      if (error) {
        removeLoaderScript()
        reject(error)
        return
      }
      resolve()
    }

    script.dataset.amapLoader = 'true'
    script.src = buildAMapScriptUrl(retryIndex)
    script.async = true
    script.onload = () => {
      if ((window as any).AMap) {
        finish()
      } else {
        finish(new Error('AMap loaded but window.AMap is unavailable'))
      }
    }
    script.onerror = () => finish(new Error('Failed to load AMap script'))
    timeoutId = window.setTimeout(() => {
      finish(new Error('AMap script loading timed out'))
    }, SCRIPT_TIMEOUT)

    document.head.appendChild(script)
  })
}

export const loadAMapScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('AMap can only be loaded in browser'))
  }

  if ((window as any).AMap) {
    return Promise.resolve()
  }

  if (amapLoadingPromise) {
    return amapLoadingPromise
  }

  ;(window as any)._AMapSecurityConfig = {
    securityJsCode: AMAP_SECURITY_CODE
  }

  amapLoadingPromise = (async () => {
    let lastError: unknown = null
    for (let retryIndex = 0; retryIndex <= MAX_RETRY_COUNT; retryIndex += 1) {
      try {
        await loadScriptOnce(retryIndex)
        return
      } catch (error) {
        lastError = error
        await new Promise((resolve) => window.setTimeout(resolve, 400 * (retryIndex + 1)))
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Failed to load AMap script')
  })().catch((error) => {
    amapLoadingPromise = null
    throw error
  })

  return amapLoadingPromise
}

export const reverseGeocode = (lng: number, lat: number): Promise<string> => {
  return reverseGeocodeLocation(lng, lat).then((location) => location.address)
}

export interface ReverseGeocodeLocation {
  address: string
  region: string
}

const ensureAMapPlugin = (pluginName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const AMap = (window as any).AMap
    if (!AMap) {
      reject(new Error('AMap is unavailable'))
      return
    }

    const shortName = pluginName.replace('AMap.', '')
    if (AMap[shortName]) {
      resolve()
      return
    }

    AMap.plugin([pluginName], () => {
      if (AMap[shortName]) {
        resolve()
      } else {
        reject(new Error(`${pluginName} plugin is unavailable`))
      }
    })
  })
}

export const reverseGeocodeLocation = (lng: number, lat: number): Promise<ReverseGeocodeLocation> => {
  return new Promise(async (resolve, reject) => {
    const AMap = (window as any).AMap
    if (!AMap) {
      reject(new Error('AMap is unavailable'))
      return
    }

    try {
      await ensureAMapPlugin('AMap.Geocoder')
    } catch (error) {
      reject(error)
      return
    }

    const geocoder = new AMap.Geocoder()
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      const regeocode = result?.regeocode || {}
      const formattedAddress = regeocode.formattedAddress || ''
      if ((status === 'complete' || result?.info === 'OK') && formattedAddress) {
        const addressComponent = regeocode.addressComponent || {}
        resolve({
          address: formattedAddress,
          region: addressComponent.district || ''
        })
        return
      }
      reject(new Error(`Failed to reverse geocode location: ${status || result?.info || 'unknown'}`))
    })
  })
}

export const waitForContainerVisible = (element: HTMLElement, maxAttempts = 20): Promise<void> => {
  return new Promise<void>((resolve) => {
    const check = (attempt: number) => {
      if (attempt >= maxAttempts) {
        resolve()
        return
      }
      const rect = element.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        resolve()
      } else {
        setTimeout(() => check(attempt + 1), 50)
      }
    }
    check(0)
  })
}
