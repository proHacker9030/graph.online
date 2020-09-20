<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>

        <v-card-text>
          <v-text-field
            label="Введите название вершины"
            v-model="newName"
            :rules="[rules.required, rules.twoChar]"
            ref="nameInput"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="cancel">
            Отменить
          </v-btn>

          <v-btn color="green darken-1" text @click="add">
            Ок
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  export default {
    props: ["dialog"],
    //6

    data() {
      return {
        title: "Добавить вершину",
        desc: "",
        newName: "",
        rules: {
          required: value => !!value || "Это поле является обязательным",
          twoChar: value =>
            (value.length <= 2) ||
            "Значение должно содержать не более 2 символов"
        }
      };
    },

    methods: {
      add() {

        if (this.$refs.nameInput.validate(true))
          this.$emit("addVertex", this.newName);

      },
      cancel() {
        this.$emit("cancel");
      }
    }
  };
</script>
