import { DemoEffect } from './effect'

class Stanched extends DemoEffect {
  static id = 'stanched' as const
  id = Stanched.id
  immunities = ['bleeding' as const]
  uses = 3

  postSceneChange = () => this.use()
}

export default Stanched
