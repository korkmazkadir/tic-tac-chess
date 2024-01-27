<template>
    <v-dialog v-model="isActive" width="auto">
        <v-card :title="props.title">
            <v-card-text>

                <v-responsive>
                    
                    <v-row>
                        <v-col>
                            <p>{{ message }}</p>
                        </v-col>
                    </v-row>


                    <v-row>
                        <v-col>
                            <v-btn color="primary" @click="emit('close')" block>ok</v-btn>
                        </v-col>
                    </v-row>

                </v-responsive>


            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import { computed } from 'vue'

const emit = defineEmits<{
    (e: 'close'): void
}>()

const props = defineProps({
    isActive: Boolean,
    title: String,
    message: String
})

const isActive = computed({
    get() {
        return props.isActive
    },
    set() {
    }
})

</script>

<style scoped>
</style>