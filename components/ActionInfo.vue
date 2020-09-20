<template>
  <v-alert type="info">
    {{text}}
  </v-alert>
</template>

<script>
export default {
  name: "ActionInfo",
  props: {
    text: {
      type: String,
      default: "Перемещайте объекты или перемещайте рабочую область"
    }
  }
};
</script>

<style scoped></style>
