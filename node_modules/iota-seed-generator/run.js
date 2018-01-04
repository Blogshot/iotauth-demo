const a = require('./')

async function generateSeed() {
  try {
    console.log(await a())
  }
  catch (err) {
    console.log('Error: ', err)
  }
}
generateSeed()
