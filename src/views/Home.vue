<template>

    <v-container class="fill-height" fluid>
        <v-responsive class="align-center text-center fill-height">

            <v-row class="d-flex align-center justify-center">
                <v-col cols="auto">
                    <v-btn size="large" @click="createGame" block>
                        <v-icon icon="mdi-gamepad-round-outline" size="x-large" start />
                        Create a Game
                    </v-btn>
                </v-col>
            </v-row>

            <v-row class="d-flex align-center justify-center">
                <v-col cols="auto">
                    <v-btn  size="large" @click="joinGameDialog.show()" block>
                        <v-icon icon="mdi-gamepad-variant-outline" size="x-large" start />
                        Join to a Game
                    </v-btn>
                </v-col>
            </v-row>


            <CreateGameDialog v-bind="createGameDialog" />

            <JoinGameDialog v-bind="joinGameDialog" @close="joinGameDialog.hide()" />

        </v-responsive>
    </v-container>

    

</template>


<script setup lang="ts">

import { CreateNewGame, initGame } from '@/store'
import CreateGameDialog from '@/components/CreateGameDialog.vue';
import JoinGameDialog from '@/components/JoinGameDialog.vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';

const createGameDialog = reactive({
    isActive : false,
    gameId : "",
    show: function(){ this.isActive = true }
})

const joinGameDialog = reactive({
    isActive : false,
    show : function(){ this.isActive = true },
    hide : function(){ this.isActive = false }
})

const createGame = function(){
    createGameDialog.gameId = CreateNewGame()
    createGameDialog.show()
}

// inits the game
onMounted(()=>initGame())

</script>
