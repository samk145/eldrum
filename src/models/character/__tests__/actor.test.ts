import { Actor } from '../actor'

describe('Actor health limit', () => {
  it('Should never go below limit', () => {
    expect(Actor.calcLimitedChangeValue(-10, 5, 0)).toEqual(-5)
  })
  it('Should should stop at the limit when change is negative', () => {
    expect(Actor.calcLimitedChangeValue(-10, 5, 3)).toEqual(-2)
  })
  it('Should should stop at the limit when change is positive', () => {
    expect(Actor.calcLimitedChangeValue(10, 5, 7)).toEqual(2)
  })
  it('Should always result in negative or neutral value when change is negative', () => {
    const outputs = [
      Actor.calcLimitedChangeValue(-10, 5, 5),
      Actor.calcLimitedChangeValue(-20, 1, 5),
      Actor.calcLimitedChangeValue(-10, 20, 12)
    ]

    expect(outputs).toEqual([0, 0, -8])
  })
  it('Should always result in positive or neutral value when change is positive', () => {
    const outputs = [
      Actor.calcLimitedChangeValue(10, 5, 5),
      Actor.calcLimitedChangeValue(20, 1, 5),
      Actor.calcLimitedChangeValue(50, 20, 30)
    ]

    expect(outputs).toEqual([0, 4, 10])
  })
})
