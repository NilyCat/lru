import { date } from '@nily/utils'
import { LRU, LRUKeyType, LRUValueType } from '../src'

function sleep(s: number) {
  return new Promise(resolve => {
    setTimeout(resolve, s * 1_000)
  })
}

describe('LRU', () => {
  test('should get value', () => {
    const lru = new LRU()
    lru.put('a', 1)
    expect(lru.get('a')).toBe(1)
  })

  test('should get value with initial cache', () => {
    const lru = new LRU({
      cache: new Map<LRUKeyType, LRUValueType>(Object.entries({
        a: {
          expiredAt: date.timestamp() + 60,
          value: 1
        }
      }))
    })
    expect(lru.get('a')).toBe(1)
  })

  test('should put value', () => {
    const lru = new LRU({
      capacity: 1
    })
    lru.put('a', 1)
    lru.put('b', 1)
    lru.put('a', 2)
    lru.put('b', 2)
    expect(lru.get('a')).toBe(undefined)
    expect(lru.get('b')).toBe(2)
  })

  test('value of expired key should be undefined', async () => {
    const lru = new LRU({
      expires: 2
    })
    lru.put('a', 1)
    await sleep(4)
    expect(lru.get('a')).toBe(undefined)
  })
})
