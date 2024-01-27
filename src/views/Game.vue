<template>
    <Board />
</template>


<script setup lang="ts">
import { onMounted } from 'vue';
import Board from '../components/Board.vue'

onMounted(()=>document.body.focus())

</script>
