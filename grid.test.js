const { Grid } = require('./grid.js')

const ng = new Grid({width: 10, height: 10})

for( let y=0; y<10; y++)
    for( let x=0; x<10; x++)
        ng.setCell({x, y, value: y*10+x})

test('toString()', () => {
    expect( ng.toString()).toBe(`0 1 2 3 4 5 6 7 8 9
10 11 12 13 14 15 16 17 18 19
20 21 22 23 24 25 26 27 28 29
30 31 32 33 34 35 36 37 38 39
40 41 42 43 44 45 46 47 48 49
50 51 52 53 54 55 56 57 58 59
60 61 62 63 64 65 66 67 68 69
70 71 72 73 74 75 76 77 78 79
80 81 82 83 84 85 86 87 88 89
90 91 92 93 94 95 96 97 98 99`)
})

test('subGrid() all', () => {
    expect( ng.subGrid({ x: 0, y: 0, width: ng.width, height: ng.height }).toString()).toBe(`0 1 2 3 4 5 6 7 8 9
10 11 12 13 14 15 16 17 18 19
20 21 22 23 24 25 26 27 28 29
30 31 32 33 34 35 36 37 38 39
40 41 42 43 44 45 46 47 48 49
50 51 52 53 54 55 56 57 58 59
60 61 62 63 64 65 66 67 68 69
70 71 72 73 74 75 76 77 78 79
80 81 82 83 84 85 86 87 88 89
90 91 92 93 94 95 96 97 98 99`)
})

test('subGrid() fitting within grid', () => {
    expect( ng.subGrid({ x: 1, y: 2, width: 3, height: 4 }).toString()).toBe(`21 22 23
31 32 33
41 42 43
51 52 53`)
})

test('subGrid() x and y too low', () => {
    expect( () => ng.subGrid({ x: -1, y: -2, width: 3, height: 2 })).toThrow(Grid.ERROR.OUT_OF_BOUNDS)
})

test('subGrid() x and y too high', () => {
    expect( () => ng.subGrid({ x: 8, y: 9, width: 4, height: 8 }).toString()).toThrow(Grid.ERROR.OUT_OF_BOUNDS)
})

// Grid differences

const grid = new Grid({ width: 3, height: 3})
const grid2 = new Grid({ width: 3, height: 3})
const grid3 = new Grid({ width: 3, height: 3})

for(let y=0; y<3; y++)
    for(let x=0; x<3; x++) {
        grid.setCell({ x, y, value: y*10+x })
        grid2.setCell({ x, y, value: y*10+x })
        grid3.setCell({ x, y, value: y*10+x })
    }

grid3.setCell({ x:1, y:1, value: 0 })
grid3.setCell({ x:2, y:1, value: 71 })

test('equalTo', () => {
    expect( grid.equalTo( grid2)).toBe( true)
})

test('not equalTo', () => {
    expect( grid.equalTo( grid3)).toBe( false)
})

test('clone()', () => {
    expect( grid.equalTo( grid2.clone())).toBe( true)
})

test('different clone()', () => {
    expect( grid.equalTo( grid3.clone())).toBe( false)
})

test('diff() with equal grids', () => {
    expect( grid.diff( grid2)).toEqual( [])
})

test('diff() with unequal grids', () => {
    expect( grid.diff( grid3)).toEqual( [{x: 1, y: 1}, {x: 2, y: 1}])
})

test('diff() with differently sized grids', () => {
    expect( () => ng.diff( grid)).toThrow( Grid.ERROR.SIZE_MISMATCH)
})

// fill

test('fill()', () => {
    const grid = new Grid({width: 3, height: 3})
    grid.fill(0)

    expect( grid.toString()).toEqual("0 0 0\n0 0 0\n0 0 0")

    grid.fill(32)
    expect( grid.toString()).toEqual("32 32 32\n32 32 32\n32 32 32")
})

test('fillFunc()', () => {
    const grid = new Grid({width: 3, height: 3})

    grid.fillFunc( ({x,y}) => y*10+x)
    expect( grid.toString()).toEqual("0 1 2\n10 11 12\n20 21 22")

    grid.fillFunc( ({x,y}) => (y+x)%2)
    expect( grid.toString()).toEqual("0 1 0\n1 0 1\n0 1 0")
})

test('find(grid)', () => {
    for(let i=0; i<1000; i++) {
        const x = Math.floor( Math.random()* (ng.width-4))
        const y = Math.floor( Math.random()* (ng.height-4))

        const w = Math.floor( Math.random()* (ng.width-x-2))+1
        const h = Math.floor( Math.random()* (ng.height-y-2))+1

        const subGrid = ng.subGrid({ x, y, width: w, height: h})
        expect( ng.find( subGrid)).toEqual({ x, y })
    }
})

test('findValue()', () => {
    expect( ng.findValue({value:13})).toEqual( {x:3, y:1})
})
