# iota-seed-generator

[![Build Status](https://travis-ci.org/bmavity/iota-seed-generator.svg?branch=master)](https://travis-ci.org/bmavity/iota-seed-generator) [![Windows Build status](https://ci.appveyor.com/api/projects/status/9hxct3gc6q8fae68/branch/master?svg=true)](https://ci.appveyor.com/project/BrianMavity/iota-seed-generator/branch/master)


## Install
`yarn install iota-seed-generator`

## Usage
```javascript
import generateSeed from '../'

async function seed() {
  try {
    const seed = await generateSeed()
    
    // Use seed
  }
  catch (err) {
    // Handle error
  }
}

seed()
```
