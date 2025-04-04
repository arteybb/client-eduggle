<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <RouterView />

</template>



<style>
*,
html,
body {
  touch-action: manipulation;
}

.el-button--primary {
  background-color: #000;
  border: none;
}

.el-button--primary:hover {
  background-color: #000;
}

.el-tabs__item.is-active,
.el-tabs__item:hover {
  color: gray;
}

.el-tabs__active-bar {
  background-color: #000;
}

.el-dialog {
  border-radius: 25px;
  padding: 30px;
}

.el-input__wrapper .is-focus {
  box-shadow: 0 0 0 1px #ccc;
}
</style>