import { clampBetween } from '../misc'

describe('misc', () => {
  it('should clamp a value between a min and a max', () => {
    expect(clampBetween(5, 0, 4)).toBe(4)
    expect(clampBetween(1.25, 1.1, 1.5)).toBe(1.25)
    expect(clampBetween(100, 5, 99)).toBe(99)
    expect(clampBetween(-1, -2, 3)).toBe(-1)
    expect(clampBetween(-1, 0, 1)).toBe(0)
    expect(clampBetween(-1.5, -1, 100)).toBe(-1)
    expect(clampBetween(100000, 0, 1)).toBe(1)
    expect(clampBetween(1.7, 0.05, 1.25)).toBe(1.25)
  })
})
