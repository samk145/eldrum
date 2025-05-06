import { getNotificationTimestamp } from '../../helpers/misc'

describe('Notifications timestamp', () => {
  it.each([
    ['2022-01-02T08:06:02', '2022-01-02T17:00:00'],
    ['2010-11-24T21:22:00', '2010-11-25T10:00:00'],
    ['1999-04-05T00:55:10', '1999-04-05T10:00:00'],
    ['1985-09-26T15:09:25', '1985-09-27T06:00:00']
  ])(
    'Should return an expected future date',
    (inputDateString: string, expectedDateString: string) => {
      const inputDateTimestamp = Date.parse(inputDateString)
      const expectedTimestamp = Date.parse(expectedDateString)
      const resultTimestamp = getNotificationTimestamp(inputDateTimestamp)

      expect(resultTimestamp).toEqual(expectedTimestamp)
    }
  )

  test('Should return four new timestamps in sequence based on the original timestamp', () => {
    const results = []
    let timestamp = Date.parse('2022-01-01T00:00:00')
    let numberOfLoops = 4

    while (numberOfLoops > 0) {
      timestamp = getNotificationTimestamp(timestamp)
      results.push(timestamp)
      numberOfLoops--
    }

    expect(results[0]).toEqual(Date.parse('2022-01-01T10:00:00'))
    expect(results[1]).toEqual(Date.parse('2022-01-01T17:00:00'))
    expect(results[2]).toEqual(Date.parse('2022-01-02T06:00:00'))
    expect(results[3]).toEqual(Date.parse('2022-01-02T17:00:00'))
  })
})
