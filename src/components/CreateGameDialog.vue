<template>
    <v-dialog v-model="isActive" width="auto ">
        <v-card title="Creating new game">
            <v-card-text>

                <v-responsive>
                    <small>You need to share the following game id with you opponent.</small>

                    <v-text-field class="centered-input" align-center v-model="$props.gameId" type="text" variant="outlined"
                        @click:append-inner="copyToClipboard" :readonly="true"></v-text-field>

                    <v-btn color="primary" @click="$router.push('/tic-tac-chess')" block>proceed to game</v-btn>
                </v-responsive>


            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import { computed } from 'vue'

const props = defineProps({
    isActive: Boolean,
    gameId: String
})

const isActive = computed({
    get() {
        return props.isActive
    },
    set() {
    }
})

const copyToClipboard = function () {
    if (props.gameId) {
        writeClipboardText(props.gameId)
    }
}

async function writeClipboardText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error:any) {
        console.error(error.message);
    }
}

</script>

<style scoped>
.centered-input:deep(input) {
    text-align: center
}
</style>