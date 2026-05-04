let amapLoadingPromise: Promise<void> | null = null

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
    securityJsCode: '1b5870e9227ca6f29ae1d37bee644626'
  }

  amapLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src =
      'https://webapi.amap.com/maps?v=2.0&key=a7b3327e03aded1d1c991632d50f0d51&plugin=AMap.Tooltip,AMap.Geocoder'
    script.async = false
    script.onload = () => {
      if ((window as any).AMap) {
        resolve()
      } else {
        reject(new Error('AMap loaded but window.AMap is unavailable'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load AMap script'))
    document.head.appendChild(script)
  }).catch((error) => {
    amapLoadingPromise = null
    throw error
  })

  return amapLoadingPromise
}

export const reverseGeocode = (lng: number, lat: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const AMap = (window as any).AMap
    if (!AMap) {
      reject(new Error('AMap is unavailable'))
      return
    }

    const geocoder = new AMap.Geocoder()
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result?.info === 'OK') {
        resolve(result.regeocode?.formattedAddress || '')
        return
      }
      reject(new Error('Failed to reverse geocode location'))
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
