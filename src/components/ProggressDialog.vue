<template>
    <v-dialog v-model="isActive" width="30%">
        <v-card :title="props.title">
            <v-card-text>

                {{ message }}

                <v-progress-linear class="mt-8" color="success" indeterminate reverse></v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import { computed } from 'vue'

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

/*
const progress = reactive({
    isActive: false,
    title: "",
    message: "",
    show: function (title: string) {
        this.isActive = true
        this.title = title
        return (message: string) => this.message = message
    },
    hide: function () {
        this.isActive = false
        this.title = ""
        this.message = ""
    }
})

*/

</script>