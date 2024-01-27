<template>
    <v-dialog v-model="isActive" width="auto">
        <v-card title="Join a game">
            <v-card-text>

                <v-responsive>
                    <small>Enter the game id</small>

                    <v-text-field class="centered-input" align-center v-model="gameId" type="text" inputmode="numeric"
                        variant="outlined"></v-text-field>

                    <v-row>
                        <v-col>
                            <v-btn color="primary" @click="emit('close')" block>Cancel</v-btn>
                        </v-col>

                        <v-col>
                            <v-btn :disabled="!gameId" color="primary" @click="joinGame" block>Join</v-btn>
                        </v-col>
                    </v-row>

                </v-responsive>


            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { computed } from 'vue'
import { JoinToGame } from '@/store'
import router from '@/router';

const emit = defineEmits<{
    (e: 'close'): void
}>()

const props = defineProps({
    isActive: Boolean
})

const gameId = ref("")

const isActive = computed({
    get() {
        return props.isActive
    },
    set() {
    }
})

const joinGame = function () {
    JoinToGame(gameId.value)
    router.push('/tic-tac-chess')
}

</script>

<style scoped>
.centered-input:deep(input) {
    text-align: center
}
</style>