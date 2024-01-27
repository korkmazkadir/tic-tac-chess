<template>
    <svg :width="4 * props.cellSize" :height="props.cellSize">

        <g>
            <g :class="{ pit: true, selected: selectedPiece && selectedPiece == props.pieces[index - 1], needToPlay: needToPlay }"
                v-for="index in 4" @click="selectPiece(index - 1)" v-bind:key="index">

                <rect :x="((index - 1) * props.cellSize)" y="0" :width="props.cellSize" :height="props.cellSize" />

                <image v-if="pieces[index - 1]" :x="((index - 1) * props.cellSize)" :y="0" :width="props.cellSize"
                    :height="props.cellSize" :href="getPieceView(pieces[index - 1])" />

            </g>
        </g>

    </svg>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { type ChessPiece, Color } from '@/type'

import { WhitePieceImages, BlackPieceImages } from './pieces/Pieces'

interface Props {
    cellSize: number,
    pieces: ChessPiece[],
    disabled: boolean,
    needToPlay: boolean
}

const props = defineProps<Props>()


const emit = defineEmits<{
    (e: 'pieceSelected', piece: ChessPiece | null, deselect: null | (() => void), move: null | (() => void)): void
}>()


const getPieceView = function (piece: ChessPiece) {

    if (!piece) {
        return
    }

    return piece.color == Color.White ? WhitePieceImages[piece.type] : BlackPieceImages[piece.type]
}

const selectedPiece = ref<ChessPiece | null>(null)
const deselect = () => { selectedPiece.value = null }

const selectPiece = function (index: number) {

    if (props.disabled) {
        return
    }

    const piece: ChessPiece = props.pieces[index]

    if (!piece) {
        return
    }

    // deselects piece on pit
    if (selectedPiece.value == piece) {
        selectedPiece.value = null
        emit('pieceSelected', null, null, null)
        return;
    }

    //TODO: fix props edit issue
    //@ts-ignore
    const move = () => { props.pieces[index] = null }

    selectedPiece.value = piece
    emit('pieceSelected', piece, deselect, move)
}

</script>

<style scoped>
svg {
    background-color: aliceblue;
}

.pit {
    fill: beige;
    stroke: beige;

    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}

.pit:hover {
    cursor: pointer;
    stroke: black;
}

.selected {
    fill: yellow !important;
}

.needToPlay{
    fill: #A1C7E0;
    stroke: #A1C7E0;
}

</style>