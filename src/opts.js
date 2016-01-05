import path from 'path'
import rc from 'rc'
import util from 'slap-util'

import pkg from '../package'
const configFile = path.resolve(__dirname, '..', `${pkg.name}.ini`)
export default util.parseOpts(rc(pkg.name, configFile))
