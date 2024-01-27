import { reactive } from 'vue'
import { WhitePieces, BlackPieces, BoardCells, GameState, Cell, ChessPiece, Color } from '@/type'
import { GameStateMachine } from './game-service'


export interface GameData {
    id: string

    isOwner:boolean

    //round: number
    step: number
    state: GameState

    boardCells: Cell[][]
    whitePieces: ChessPiece[]
    blackPieces: ChessPiece[]
    
    canPlay: ()=>boolean
    play: ()=>void
    pieceColor: ()=>Color

    errorCode: number | null

}

let GameSM : GameStateMachine;
export let game: GameData;

export const initGame = function(){
    
    game = reactive({
        id: "",
    
        isOwner:false,
    
        //round: 0,
        step: 0,
        state: GameState.Undefined,
    
        boardCells: BoardCells(),
        whitePieces: WhitePieces(),
        blackPieces: BlackPieces(),
    
        canPlay: function(){
            if(this.isOwner){
                return (this.step % 2) == 0
            }
    
            return (this.step % 2) == 1
        },
    
        play: function(){
            console.log(`sending update...`)
            this.step++
            GameSM.updateState()
        },
    
        pieceColor: function():Color{
            return this.isOwner ? Color.White : Color.Black
        },

        errorCode: null
    })

    GameSM = new GameStateMachine(game);

}


/// Communication with server

export const CreateNewGame = function(){
    return GameSM.createGame()
}

export const JoinToGame = function(gameId: string){
    GameSM.joinGame(gameId)
}

//const GameSM : GameStateMachine = new GameStateMachine(game)


