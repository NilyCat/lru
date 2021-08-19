import { conv, date } from '@nily/utils'

export type LRUKeyType = string | number | Symbol

export interface LRUValueType<T = any> {
  expiredAt: number
  value: T
}

export interface LRUOptions<T = any> {
  // 数量限制
  capacity?: number
  // 有效时间限制，单位秒，如果 <= 0 则永不过期
  expires?: number
  // 外部缓存
  cache?: Map<LRUKeyType, LRUValueType<T>>
  // 监听变化
  onChange?: (cache: Map<LRUKeyType, LRUValueType<T>>) => void
}

export class LRU<T = any> {
  private readonly options!: LRUOptions<T>
  private readonly cache!: Map<LRUKeyType, LRUValueType<T>>

  constructor(options?: LRUOptions<T>) {
    // 初始化状态
    this.cache = options?.cache ?? new Map<LRUKeyType, LRUValueType<T>>()
    this.options = {
      capacity: conv.int(options?.capacity, 10),
      expires: conv.int(options?.expires, 0),
      onChange: options?.onChange
    }
  }

  get(key: LRUKeyType): T | undefined {
    if (this.cache.has(key)) {
      const cache = this.cache.get(key)

      if (cache) {
        if (cache.expiredAt === 0 || cache.expiredAt >= date.timestamp()) {
          return cache.value
        } else {
          this.delete(key)
        }
      }
    }
  }

  put(key: LRUKeyType, value: T) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else {
      if (this.cache.size === this.options.capacity!) {
        const delKey = this.cache.keys().next().value
        this.cache.delete(delKey)
      }
    }
    this.cache.set(key, {
      expiredAt: this.options.expires! > 0 ? date.timestamp() + this.options.expires! : 0,
      value
    })
    this.options.onChange && this.options.onChange(this.cache)
  }

  delete(key: LRUKeyType) {
    this.cache.delete(key)
    this.options.onChange && this.options.onChange(this.cache)
  }
}
