const util = require('util')
const proc = require('child_process')
const exec = util.promisify(proc.exec)
const spawn = proc.spawn


module.exports = function getSeedGenerationCommand() {
  switch(process.platform) {
    case 'darwin':
      return createOsxSeed()
    case 'win32':
      return createWindowsSeed()
    default:
      return createLinuxSeed() 
  }
}

function createLinuxSeed() {
  // 'cat /dev/urandom |tr -dc A-Z9|head -c${1:-81}'
  return new Promise((resolve, reject) => {
    const seed = spawn('cat /dev/urandom |tr -dc A-Z9|head -c${1:-81}', {
      shell: true
    })
    
    seed.stdout.on('data', (data) => {
      resolve(data.toString())
    })
    
    seed.stderr.on('data', err => {
      reject(err.toString())
    })

    seed.on('error', err => {
      reject(err)
    })
    
    seed.on('close', (code) => {
      seed.kill()
    })
  })
}

function createOsxSeed() {
  // 'cat /dev/urandom |LC_ALL=C tr -dc "A-Z9" |fold -w 81 |head -n 1'
  return new Promise((resolve, reject) => {
    const seed = spawn('head', ['-n', '1'])
    const lines = spawn('fold', ['-w', '81'])
    const alpha = spawn('tr', ['-dc', 'A-Z9'], { env: Object.assign({}, process.env, { LC_ALL: 'C' })})
    const rand = spawn('cat', ['/dev/urandom'])
    
    seed.stdout.on('data', (data) => {
      resolve(data.toString().replace('\n', ''))
    })
    
    seed.stderr.on('data', reject)
    seed.on('error', reject)
    
    seed.on('close', (code) => {
      seed.kill()
      lines.kill()
      alpha.kill()
      rand.kill()
    })
  
    rand.stdout.pipe(alpha.stdin)
    alpha.stdout.pipe(lines.stdin)
    lines.stdout.pipe(seed.stdin)
  })
}

function createWindowsSeed() {
  // '-join ([char[]](65..90+57..57)*100 | Get-Random -Count 81)'
  return new Promise(async (resolve, reject) => {
    try {
      const result = await exec('powershell.exe -Command "-join ([char[]](65..90+57..57)*100 | Get-Random -Count 81)"')

      if(result.stdout) {
        const textContainingSeed = result.stdout.replace('\r\n', '')
        const textParts = textContainingSeed.split('\n')

        resolve(textParts.pop())
      } else {
        reject(result.stderr)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
