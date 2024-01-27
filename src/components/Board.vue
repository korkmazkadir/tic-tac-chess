<template>
    <v-container fluid>
        <v-responsive class="align-center text-center fill-height">

            <v-row align="center" no-gutters>
                <v-col>
                    <Pit :disabled="true" :cell-size="boardCellSize"
                        :pieces="game.pieceColor() == Color.White ? game.blackPieces : game.whitePieces"
                        :need-to-play="!game.canPlay()" />
                </v-col>
            </v-row>

            <v-row align="center" no-gutters>

                <v-col>

                    <svg :width="4 * boardCellSize" :height="4 * boardCellSize">

                        <g v-for="(cellRow, rowIndex) in game.boardCells" v-bind:key="rowIndex">
                            <g v-for="(cell) in cellRow" :class="{ cell: true }" @click="cellSelected(cell)"
                                v-bind:key="cell.key">

                                <rect
                                    :class="{ white: cell.color == Color.White, black: cell.color == Color.Black, selected: selectedBoardCell == cell }"
                                    :x="xPos(cell.x)" :y="yPos(cell.y)" :width="boardCellSize" :height="boardCellSize"
                                    fill="green" />

                                <rect class="movable" :x="xPos(cell.x)" :y="yPos(cell.y)" :width="boardCellSize"
                                    :height="boardCellSize" fill="green" v-if="movableCells.get(cell.key)" />

                                <image v-if="cell.piece" :x="xPos(cell.x)" :y="yPos(cell.y)" :width="boardCellSize"
                                    :height="boardCellSize" :href="getPieceView(cell.piece)" />


                            </g>
                        </g>

                    </svg>


                </v-col>

            </v-row>

            <v-row align="center" no-gutters>
                <v-col>
                    <Pit :disabled="!game.canPlay()" :cell-size="boardCellSize"
                        :pieces="game.pieceColor() == Color.White ? game.whitePieces : game.blackPieces"
                        :need-to-play="game.canPlay()" @piece-selected="pieceSelectedOnPit" />
                </v-col>

            </v-row>


            <v-row align="center" no-gutters>
                <v-col :class="{ you: game.canPlay(), opponent: !game.canPlay() }">
                    <span v-if="game.canPlay()">your turn</span>
                    <span v-if="!game.canPlay()">opponents turn</span>
                </v-col>
            </v-row>

        </v-responsive>
    </v-container>

    <MessageDialog v-bind="messageDialog" @close="messageDialog.hide()"></MessageDialog>
</template>

<script lang="ts" setup>

import { game } from '@/store'
import { computed, ref } from 'vue';
import { Color, type Cell, type ChessPiece, PieceType, PieceDirection, GameState } from '@/type'

import { WhitePieceImages, BlackPieceImages } from './pieces/Pieces'

import Pit from './Pit.vue'
import { reactive } from 'vue';
import { watch } from 'vue';
import MessageDialog from './MessageDialog.vue';
import router from '@/router';
import { onMounted } from 'vue';

const messageDialog = reactive({
    isActive: false,
    title: "",
    message: "",
    onClose: ()=>{},
    show: function (title: string, message: string) {
        this.title = title
        this.message = message
        this.isActive = true
    },
    hide: function () {
        this.isActive = false;
        if(this.onClose){
            this.onClose();
        }
    },
})


const boardCellSize = computed((): number => {
    const width = ((window.innerWidth > 0) ? window.innerWidth : screen.width) * 0.80;
    const height = ((window.innerHeight > 0) ? window.innerHeight : screen.height) * 0.80;

    if (width > height) {
        return Math.floor(height / 6)
    }

    return Math.floor(width / 4)
})

const xPos = function (x: number) {
    return (game.isOwner ? x : 3 - x) * boardCellSize.value
}

const yPos = function (y: number) {
    return (game.isOwner ? y : 3 - y) * boardCellSize.value
}

//////
var selectedPiece = ref<ChessPiece | null>(null)
var deselectFn: null | (() => void)
var moveFn: null | (() => void)

const pieceSelectedOnPit = function (piece: null | ChessPiece, deselect: null | (() => void), move: null | (() => void)) {

    if (deselectFn && deselectFn != deselect) {
        deselectFn()
    }

    // selects movable cells
    console.log("selecting all empty cells")
    movableCells.clear()

    if (piece != null) {
        game.boardCells.forEach(row => row.forEach(c => movableCells.set(c.key, c.piece == null)))
    }


    //movableCells.forEach((value, key)=>console.log(`${key} = ${value}`));
    //

    selectedPiece.value = piece
    deselectFn = deselect
    moveFn = move

}
/////

const selectedBoardCell = ref<Cell | null>(null)

const cellSelected = function (selectedCell: Cell) {

    if (game.canPlay() == false) {
        return
    }

    if (selectedPiece.value != null && selectedCell.piece == null) {
        console.log("path 1")
        if (!movableCells.has(selectedCell.key)) {
            return;
        }
        movePiece(selectedPiece.value, selectedCell)
        if (selectedPiece.value.type == PieceType.Pawn) {
            changePawnDirection(selectedCell, selectedPiece.value)
        }
        deselectPiece()

        //updates game state
        game.play()
        return
    }

    if (selectedPiece.value == null && selectedCell.piece) {
        console.log("path 2")
        selectPieceOnBoard(selectedCell)
        return
    }

    if (selectedPiece.value == selectedCell.piece) {
        console.log("path 5")
        deselectPiece()
    }

    if (selectedPiece.value != null && selectedCell.piece && selectedCell.piece.color == selectedPiece.value.color) {
        console.log("path 3")
        deselectPiece()
        selectPieceOnBoard(selectedCell)
        return
    }


    //eat piece
    if (selectedPiece.value != null && selectedCell.piece && selectedCell.piece.color != selectedPiece.value.color) {

        console.log("path 4")
        if (!movableCells.get(selectedCell.key)) {
            return;
        }

        if (game.step < 6) {
            messageDialog.show("Warning", "Each player needs to place at least three pieces on board before starting to capture.")
            return
        }

        if (selectedPiece.value.type == PieceType.Pawn) {
            changePawnDirection(selectedCell, selectedPiece.value)
        }

        movePieceToHome(selectedCell.piece)
        movePiece(selectedPiece.value, selectedCell)
        deselectPiece()

        //updates game state
        game.play()
        return
    }

}

const changePawnDirection = function (selectedCell: Cell, pawn: ChessPiece,): void {
    if (selectedCell.y == 0) {
        pawn.direction = PieceDirection.Backward;
    } else if (selectedCell.y == 3) {
        pawn.direction = PieceDirection.Forward;
    }
}

const markAllowedMoves = function () {
    if (selectedBoardCell.value == null || selectedBoardCell.value.piece == null) {
        return false
    }

    const cell: Cell = selectedBoardCell.value;
    const piece: ChessPiece = selectedBoardCell.value.piece;

    if (piece.type == PieceType.Rook) {
        movableCells.clear()
        calculateMovableCells(cell, +1, 0)
        calculateMovableCells(cell, -1, 0)
        calculateMovableCells(cell, 0, +1)
        calculateMovableCells(cell, 0, -1)
    } else if (piece.type == PieceType.Bishop) {
        movableCells.clear()
        calculateMovableCells(cell, +1, +1)
        calculateMovableCells(cell, -1, -1)
        calculateMovableCells(cell, +1, -1)
        calculateMovableCells(cell, -1, +1)
    } else if (piece.type == PieceType.Knight) {
        movableCells.clear()
        calculateMovableCells(cell, +1, -2, false)
        calculateMovableCells(cell, +1, +2, false)
        calculateMovableCells(cell, -1, -2, false)
        calculateMovableCells(cell, -1, +2, false)
        calculateMovableCells(cell, -2, +1, false)
        calculateMovableCells(cell, +2, +1, false)
        calculateMovableCells(cell, -2, -1, false)
        calculateMovableCells(cell, +2, -1, false)
    } else if (piece.type == PieceType.Pawn) {
        movableCells.clear()
        calculateMovableCellsForPawn(cell)
    }

}

const movableCells = reactive(new Map())

const calculateMovableCellsForPawn = function (cell: Cell) {

    if (cell.piece == null) {
        console.error("illegal state, pawn not available")
        return
    }

    const yDirection = cell.piece.direction == PieceDirection.Backward ? +1 : -1;

    const y = cell.y + yDirection

    //foward
    if (game.boardCells[y] && game.boardCells[y][cell.x] && game.boardCells[y][cell.x].piece == null) {
        movableCells.set(game.boardCells[y][cell.x].key, true)
    }

    //left
    if (game.boardCells[y] && game.boardCells[y][cell.x - 1] && game.boardCells[y][cell.x - 1].piece && game.boardCells[y][cell.x - 1].piece?.color != cell.piece.color) {
        movableCells.set(game.boardCells[y][cell.x - 1].key, true)
    }

    //right
    if (game.boardCells[y] && game.boardCells[y][cell.x + 1] && game.boardCells[y][cell.x + 1].piece && game.boardCells[y][cell.x + 1].piece?.color != cell.piece.color) {
        movableCells.set(game.boardCells[y][cell.x + 1].key, true)
    }

}

const calculateMovableCells = function (cell: Cell, xDirection: number, yDirection: number, recursive: boolean = true) {

    const req = function (x: number, y: number) {

        if (!game.boardCells[y] || !game.boardCells[y][x]) {
            return
        }

        const visitedCell: Cell = game.boardCells[y][x]

        //console.log(`${visitedCell.key} --> ${ JSON.stringify(visitedCell.piece) }`)

        if (visitedCell.piece) {
            console.log(visitedCell.piece)
            movableCells.set(visitedCell.key, visitedCell.piece.color != cell.piece?.color)
            return
        }

        movableCells.set(visitedCell.key, true)

        if (!recursive) {
            return
        }

        req(x + xDirection, y + yDirection)
    }


    req(cell.x + xDirection, cell.y + yDirection)

    //console.log("lists movable cells")
    //movableCells.forEach((value, key)=>console.log(`${key} = ${value}`));
}


const movePiece = function (selectedPiece: ChessPiece, selectedCell: Cell) {
    selectedCell.piece = selectedPiece
    if (moveFn) {
        moveFn()
    }

    //deselectFn()
}

const deselectPiece = function () {
    selectedPiece.value = null
    selectedBoardCell.value = null
    movableCells.clear()
    if (deselectFn) {
        deselectFn()
    }
}

const selectPieceOnBoard = function (selectedCell: Cell) {

    if (selectedCell.piece == null) {
        throw new Error(`illegal board state`)
    }

    if (selectedCell.piece.color != game.pieceColor()) {
        return
    }

    selectedBoardCell.value = selectedCell
    selectedPiece.value = selectedCell.piece
    deselectFn = () => { selectedPiece.value = null; selectedBoardCell.value = null }
    moveFn = () => { selectedCell.piece = null }
    markAllowedMoves()
}


const getPieceView = function (piece: ChessPiece) {

    if (!piece) {
        return
    }

    return piece.color == Color.White ? WhitePieceImages[piece.type] : BlackPieceImages[piece.type]
}

const movePieceToHome = function (piece: ChessPiece) {

    //makesure that all pawns start with Forward direction
    if (piece.color == Color.White) {
        piece.direction = PieceDirection.Forward
    } else {
        piece.direction = PieceDirection.Backward
    }

    const index = Object.keys(PieceType).indexOf(piece.type)
    if (piece.color == Color.White) {
        game.whitePieces[index] = piece;
    } else if (piece.color == Color.Black) {
        game.blackPieces[index] = piece;
    } else {
        console.error("illegal state, uknown piece color.")
    }
}

const isGameFinished = function () {

    const blackPiecesOnBoard: Cell[] = []
    const whitePiecesOnBoard: Cell[] = []

    game.boardCells.forEach(cellRow => cellRow.forEach(c => {
        if (c.piece != null) {
            c.piece.color == Color.White ? whitePiecesOnBoard.push(c) : blackPiecesOnBoard.push(c)
        }
    }))


    if (whitePiecesOnBoard.length == 4 && isAllAligned(whitePiecesOnBoard)) {
        return { result: true, winner: Color.White }
    }

    if (blackPiecesOnBoard.length == 4 && isAllAligned(blackPiecesOnBoard)) {
        return { result: true, winner: Color.Black }
    }

    return { result: false, winner: null }
}

const allEqual = (arr: number[]) => arr.every(v => v === arr[0])

const isAllAligned = function (pieces: Cell[]) {

    const xPoses: number[] = pieces.map(p => p.x);
    const yPoses: number[] = pieces.map(p => p.y);

    if (allEqual(xPoses) || allEqual(yPoses)) {
        return true;
    }

    const yString = yPoses.join(",")
    const xString = xPoses.join(",")

    if (yString == "0,1,2,3" && (xString == "0,1,2,3" || xString == "3,2,1,0")) {
        return true
    }

    return false;
}

watch(game, () => {

    // game does not exists
    if(game.errorCode){
        handleWSError();
        return
    }

    const r = isGameFinished()
    if (r.result) {
        messageDialog.show("Game Over", `The winner is ${r.winner == Color.White ? "White" : "Black"}`)
        game.state = GameState.RoundEnded;
    }

})


onMounted(()=>{
    if(game.errorCode){
        handleWSError();
        return
    }
})

const handleWSError = function(){

    if(game.errorCode == 4002){
        messageDialog.show("Game does not exist", `The game with id ${game.id} does not exist.`)
        messageDialog.onClose = ()=>router.push("/")
        return
    }

    if(game.errorCode != null){
        messageDialog.show("Unhandled error", `An error occured with code ${game.errorCode}. The game will be closed.`)
        messageDialog.onClose = ()=>router.push("/")
        return
    }
}

</script>

<style scoped>
svg {
    background-color: aliceblue;
}

.cell {
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}

.cell:hover {
    cursor: pointer;
    stroke: black;
}

.black {
    fill: #769656;
}

.white {
    fill: #eeeed2;
}

.selected {
    fill: yellow !important;
}

.movable {

    fill: #BF4E63;
    fill-opacity: 0.6;
}

.you {
    color: green;
    font-size: 1.2em;
}

.opponent {
    color: gray;
    font-size: 1.2em;
}
</style>
