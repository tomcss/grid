interface Position {
    x: number,
    y: number
}

export class Grid {

    public grid: number[][]

    static ERROR = {
        OUT_OF_BOUNDS: 'Referencing co-ordinate outside of grid',
        SIZE_MISMATCH: 'Referenced grids do not match in size',
    }

    static defaultEqFunc = (a:number, b:number) => a===b

    constructor({ width, height}: { width:number, height:number} ) {

        this.grid = Array(height).fill(0).map( x => Array(width).fill(0))
    }

    /*
     * Sets a cell value and returns true if the x and y coordinates are within
     * the grid, or returns false and sets nothing if they are outside the grid.
     * @param {number} y Row index
     * @param {number} x Column index
     * @param {number} value New value for the cell
     * @returns {boolean}
     */
    setCell({ x, y, value}: { x:number, y:number, value:number}) {
        if( x<0 || y<0 || x>=this.width || y>=this.height) return false

        this.grid[y][x] = value
        return true
    }

    /*
     * Fills the grid with a custom function
     */
    fillFunc( func:({x,y}:{x: number, y:number})=>number) {
        for(let row=0; row<this.height; row++) {
            for(let col=0; col<this.width; col++) {
                this.grid[row][col] = func({x:col, y:row})
            }
        }
    }

    /*
     * Fills the grid with the specified value.
     */
    fill( value:number) {
        for(let row=0; row<this.height; row++)
            for(let col=0; col<this.width; col++)
                this.grid[row][col] = value
    }

    /*
     * Get a cell value from the grid. Returns the cell value if the x and y
     * coordinates are within the grid.
     * @param {number} x Column index
     * @param {number} y Row index
     * @returns value of cell or undefined
     */
    getCell({ x, y}: { x:number, y:number}) {
        if( x<0 || y<0 || x>=this.width || y>=this.height) return undefined

        return this.grid[y][x]
    }

    outOfBounds( ...coordinates:{ x:number, y:number}[]) {
        for( let pos of coordinates) {
            if( pos.x<0 || pos.x>=this.width ||
                pos.y<0 || pos.y>=this.height) {
                return true
            }
        }

        return false
    }

    /*
     * Returns a new grid object which is a subgrid of the current grid
     * @param {number} x Column index
     * @param {number} y Row index
     * @param {number} width Column count
     * @param {number} height Row count
     */
    subGrid({ x, y, width, height }: { x:number, y: number, width: number, height: number}) {

        if( this.outOfBounds({ x, y}, { x:width+x-1, y:height+y-1})) {
            throw( Grid.ERROR.OUT_OF_BOUNDS)
        }

        const grid = new Grid({ width, height })

        for(let row=0; row<height; row++)
            for(let col=0; col<width; col++)
                grid.setCell({ y: row, x: col, value: this.getCell({ y: y+row, x: x+col })})

        return grid
    }

    /*
     * Returns a clone of the grid by simply calling
     * subGrid on the entire grid 
     *
     * @returns {Grid} cloned grid
     */
    clone() {
        return this.subGrid({ x:0, y: 0, width: this.width, height: this.height })
    }

    /*
     * Compares two grids and returns false if they differ,
     * true if they do not
     */
    equalTo( grid2: Grid, eqFunc=Grid.defaultEqFunc) {
        if( this.height !== grid2.height) return false
        if( this.width  !== grid2.width)  return false

        for(let y=0; y<this.height; y++) {
            for(let x=0; x<this.width; x++) {
                const pos = { x, y }
                if(!eqFunc( this.getCell(pos), grid2.getCell(pos))) {
                    return false
                }
            }
        }

        return true
    }

    /*
     * Compares two grids and returns the positions where they differ
     * in an array. Throws an error if the sizes of the grids do not
     * match
     */
    diff( grid2: Grid, eqFunc=Grid.defaultEqFunc) {
        if( (this.height !== grid2.height) ||
            (this.width  !== grid2.width)) {
            throw Grid.ERROR.SIZE_MISMATCH
        }

        const result = []

        for(let y=0; y<this.height; y++) {
            for(let x=0; x<this.width; x++) {
                const pos = { x, y }
                if(!eqFunc( this.getCell(pos), grid2.getCell(pos))) {
                    result.push( pos)
                }
            }
        }

        return result
    }

    /*
     * Finds and returns all co-ordinates of matching values in the
     * following format: [[y,x]*]
     */

    findAllValues( value:number) {
        let coords:number[][] = []

        for(let row=0; row<this.height; row++)
            for(let col=0; col<this.width; col++) {
                if( this.getCell({x: col, y: row})===value) {
                    coords.push( [row, col])
                }
            }

        return coords
    }

    /* Finds the first occurrence of the specified value in the
     * grid
     */

    findValue({
        value,
        from={x: 0, y: 0},
        to={x: this.width, y: this.height}
    }:{
        value: number,
        from:Position,
        to:Position
    }) {
        for(let row=from.y; row<to.y; row++) {
            for(let col=from.x; col<to.x; col++) {
                if( this.grid[row][col] === value) return {x: col, y: row}:Position
            }
        }

        return null
    }

    /*
     * Find the first occurrence of the referenced Grid
     */

    find( grid: Grid, eqFunc=Grid.defaultEqFunc) {

        for( let row=0; row<this.height-grid.height; row++) {
            for( let col=0; col<this.height-grid.width; col++) {

                const subGrid = this.subGrid({ x: col, y: row, width: grid.width, height: grid.height})
                if( subGrid.equalTo( grid, eqFunc)) {
                    return { x: col, y: row }
                }
            }
        }

        return null
    }

    /*
     * Creates an ASCII representation of the grid
     * @returns {string} ascii grid
     */
    toString() {
        let output = this.grid.map( x => x.join(' ')).join("\n")
        return output
    }

    /*
     * The width of the grid, determined by looking at the
     * first row's length
     *
     * @returns {number} width
     */
    get width() {
        if( this.height === 0) return 0

        return this.grid[0].length
    }

    /*
     * The height of the grid, determined by looking at the
     * number of rows in the grid
     *
     * @returns {number} height
     */
    get height() {
        return this.grid.length
    }
}

