import { ref, onUnmounted, computed, type ComputedRef, onMounted } from 'vue'
interface WindowSize {
  width: number
  height: number
}
export interface UseWindowSizeI {
  mobileMode: ComputedRef<boolean>
  isMediumSize: ComputedRef<boolean>
  isSmallSize: ComputedRef<boolean>
  isVerySmallSize: ComputedRef<boolean>
}
export const useWindowSize = (): UseWindowSizeI => {
  const windowSize = ref<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const onResize = () => {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  onMounted(() => {
    window.addEventListener('resize', onResize, false)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', onResize, false)
  })

  const mobileMode = computed((): boolean => {
    const size = windowSize.value
    return size.width <= 1200
  })

  const isMediumSize = computed<boolean>(() => windowSize.value.width <= 1007)
  const isSmallSize = computed<boolean>(() => windowSize.value.width <= 767)
  const isVerySmallSize = computed<boolean>(() => windowSize.value.width <= 425)
  return {
    mobileMode,
    isMediumSize,
    isSmallSize,
    isVerySmallSize
  }
}
