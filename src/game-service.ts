import { GameData, game } from '@/store'
import { GameState } from './type';

const WSS_BASE_URL = "ws://192.168.1.11:5000"
const GAME_ID_PARAM = "game_id"
const GUEST_PARAM = "is_guest"

export class GameStateMachine {

    ws: null | WebSocket;
    gameData: GameData

    constructor(gameData: GameData) {
        this.ws = null
        this.gameData = gameData
        console.log(`SM ready, game step:${this.gameData.step}`)
    }

    createGame(): string {

        this.gameData.isOwner = true

        this.gameData.id = Math.floor(100000 + Math.random() * 900000).toString()
        
        const wssUrl = `${WSS_BASE_URL}?${GAME_ID_PARAM}=${this.gameData.id}`

        this.ws = new WebSocket(wssUrl)
        this.ws.binaryType = "arraybuffer"
        this.registerWSHandlers();

        return this.gameData.id
    }

    joinGame(gameId: string) : void {

        this.gameData.isOwner = false

        this.gameData.id = gameId
        const wssUrl = `${WSS_BASE_URL}?${GAME_ID_PARAM}=${this.gameData.id}&${GUEST_PARAM}=${true}`

        this.ws = new WebSocket(wssUrl)
        this.ws.binaryType = "arraybuffer"
        this.registerWSHandlers();
    }


    handshake(): void {
        const isOwner = this.gameData.isOwner
        const gameState = this.gameData.state

        if(isOwner && gameState == GameState.Undefined ){
            console.log("creating the game with id")
            this.gameData.state = GameState.GameCreated
            this.publishGameData()
            return
        }
        
        if (!isOwner && gameState == GameState.Undefined){
            console.log("waiting to received the game state")
            return
        }
        
        if(!isOwner && gameState == GameState.GameCreated){
            console.log("game data recived")
            this.gameData.state = GameState.GuestJoins
            this.publishGameData()
            return
        }

        if (isOwner && gameState == GameState.GuestJoins){
            console.log("guest joined the game, needs to play")
            this.gameData.state = GameState.RoundStarted
            this.publishGameData()
            return
        }

    }

    updateState():void{
        const gameState = this.gameData.state
        if ( gameState == GameState.RoundStarted ){
            // this path is reach by UI updates
            this.publishGameData()

            return
        }
    }


    registerWSHandlers(): void {

        if(this.ws == null){
            throw new Error(`illegal state: ws is null`)
        }

        this.ws.onerror = this.wsErrorHandler;
        this.ws.onclose = this.wsCloseHandler.bind(this);

        this.ws.onopen =  ()=> setTimeout(()=>this.handshake()) 
        this.ws.onmessage = this.wsMessageHandler.bind(this) 
    }

    wsCloseHandler(event: CloseEvent): void {
        game.errorCode = event.code
        console.log(event.code)
        console.log(event.reason)
    }    

    wsErrorHandler(event: Event): void {
        console.log(event)
    }

    wsMessageHandler(event: MessageEvent): void {


        if (!(event.data instanceof ArrayBuffer)) {
            console.log(event.data)
            return
        }
        //TODO:else?

        const enc = new TextDecoder("utf-8")

        const data = enc.decode(event.data) 
        console.log(`new game data available: ${data}`)
        const newGameData: GameData = JSON.parse(data)

        //this.gameData.round = newGameData.round
        this.gameData.step = newGameData.step
        this.gameData.state = newGameData.state

        this.gameData.boardCells = newGameData.boardCells
        this.gameData.whitePieces = newGameData.whitePieces
        this.gameData.blackPieces = newGameData.blackPieces

        this.handshake()
    }

    publishGameData (): void{

        if(this.ws == null){
            throw new Error(`illegal state: ws is null`)
        }

        this.ws.send(JSON.stringify(this.gameData));
    }

}