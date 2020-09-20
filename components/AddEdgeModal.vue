<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>

        <v-card-text>
          <v-text-field
            label="Введите вес ребра"
            v-model="newWeight"
            :rules="[rules.required, rules.number]"
            ref="weightInput"
            type="number"
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
      title: "Добавить ребро",
      desc: "",
      newWeight: "",
      rules: {
        required: value => !!value || "Это поле является обязательным",
        number: value =>
          (value > 0) ||
          "Значение должно быть больше 0 и целым числом"
      }
    };
  },

  methods: {
    add() {
      if (this.$refs.weightInput.validate(true))
        this.$emit("addWeight", this.newWeight);

    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>
