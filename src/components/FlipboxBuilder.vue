<template>
  <div class="flipbox-builder">
    <div class="field">
      <span :id="frontLabelId" class="field-label">Front</span>
      <RichTextEditor
        :labelledby="frontLabelId"
        field-name="Front"
        v-model="front"
      />
    </div>

    <div class="field">
      <span :id="backLabelId" class="field-label">Back</span>
      <RichTextEditor
        :labelledby="backLabelId"
        field-name="Back"
        v-model="back"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from "vue"
import RichTextEditor from "./RichTextEditor.vue"

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(["update:modelValue"])

const frontLabelId = useId()
const backLabelId = useId()

// Derive both fields from the parent so loading or resetting a card
// updates the editors as well as the preview.
const front = computed({
  get: () => props.modelValue.front,
  set: (value) =>
    emit("update:modelValue", { ...props.modelValue, front: value }),
})
const back = computed({
  get: () => props.modelValue.back,
  set: (value) =>
    emit("update:modelValue", { ...props.modelValue, back: value }),
})
</script>

<style scoped>
.flipbox-builder {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}
</style>
