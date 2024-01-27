enum PieceType {
    Pawn = "Pawn",
    Bishop = "Bishop",
    Knight = "Knight",
    Rook = "Rook"
}

enum GameState {

    Undefined = "UNDEFINED",

    GameCreated = "GAME_CREATED",
    GuestJoins= "GUEST_JOINS",
    RoundStarted= "ROUND_STARTED",
    RoundEnded= "ROUND_ENDED",

    OwnerWantsToContinue= "OWNER_WANTS_CONTINUE",
    GuestWantsToContinue= "GUEST_WANTS_CONTINUE",
    OwnerRejectsToContinue= "OWNER_REJECTS_CONTINUE",
    GuestRejectsToContinue= "GUEST_REJECTS_CONTINUE",   
}

enum Color {
    White,
    Black,
}

enum PieceDirection {
    Forward,
    Backward
}

interface ChessPiece {
    color: Color
    type: PieceType,
    direction: PieceDirection
}

interface Cell {
    x: number,
    y: number,
    key:string,
    color: Color,
    piece: ChessPiece | null
}

const WhitePieces = function (): ChessPiece[] {
    const whitePieces = [] as ChessPiece[]
    Object.keys(PieceType).forEach((pieceType) => whitePieces.push({ color: Color.White, type: pieceType as PieceType, direction: PieceDirection.Forward }))
    return whitePieces
}

const BlackPieces = function (): ChessPiece[] {
    const whitePieces = [] as ChessPiece[]
    Object.keys(PieceType).forEach((pieceType) => whitePieces.push({ color: Color.Black, type: pieceType as PieceType, direction: PieceDirection.Backward}))
    return whitePieces
}


const BoardCells = function (): Cell[][] {
    const cells = [] as Cell[][];

    //çiftse çiftler beyaz, tekse teklar beyaz
    const colorFunc = function (i: number, j: number): Color {
        if ((j % 2) == 0) {
            return (i % 2) == 0 ? Color.White : Color.Black
        }
        return (i % 2) == 1 ? Color.White : Color.Black
    }

    for (let j = 0; j < 4; j++) {
        const cellRow = [] as Cell[]
        for (let i = 0; i < 4; i++) {
            cellRow.push({ x: i, y: j, key:`${i}-${j}`, color: colorFunc(i, j), piece: null})
        }
        cells.push(cellRow)
    }

    return cells
}

export { PieceType, Color, PieceDirection, type Cell, type ChessPiece, WhitePieces, BlackPieces, BoardCells, GameState }