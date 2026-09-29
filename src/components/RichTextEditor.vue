<template>
  <div class="rich-text-editor">
    <!--
      TODO: Build formatting controls here.
      Required: paragraphs, bold, italic, and one list style (bulleted or
      numbered), plus undo and redo. Additional formatting, including the
      other list style, is optional.
      - Full command reference: https://tiptap.dev/docs/editor/api/commands

      One example button is included below to show the wiring pattern.
      Replace it with your full toolbar.
    -->
    <div class="toolbar" role="toolbar" aria-label="Text formatting">
      <button
        type="button"
        :aria-pressed="editor?.isActive('bold') ?? false"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        Bold (example)
      </button>
    </div>

    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps({
  labelledby: { type: String, required: true },
  modelValue: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update:modelValue']);

// StarterKit includes bold, italic, bullet list, ordered list,
// undo/redo (via UndoRedo), paragraphs, and more. You likely won't need
// to add extensions for the required formatting, but you're free to.
const editor = new Editor({
  extensions: [StarterKit],
  content: props.modelValue,
  editorProps: {
    attributes: { role: 'textbox', 'aria-labelledby': props.labelledby, 'aria-multiline': 'true' },
  },
  onUpdate: ({ editor: currentEditor }) => {
    emit('update:modelValue', currentEditor.getHTML());
  },
});

// Keeps the editor in sync if modelValue is changed from outside this
// component (for example, loaded from storage after a refresh).
watch(
  () => props.modelValue,
  value => {
    const isSame = value === editor.getHTML();
    if (!isSame) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  },
);

onBeforeUnmount(() => {
  editor.destroy();
});

defineExpose({ editor });
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #fff;
}

.toolbar {
  display: flex;
  gap: 4px;
  padding: 6px;
  border-bottom: 1px solid #d0d7de;
}

.editor-content {
  padding: 10px;
  min-height: 120px;
}

.editor-content :deep(p) {
  margin: 0 0 8px;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin: 0 0 8px;
  padding-left: 24px;
}
.editor-content :deep(.tiptap) {
  overflow-wrap: anywhere;
}

.editor-content :deep(pre) {
  white-space: pre-wrap;
}
</style>
