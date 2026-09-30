<template>
  <div class="rich-text-editor">
    <div
      ref="toolbarEl"
      class="toolbar"
      role="toolbar"
      :aria-label="toolbarLabel"
      @keydown="onToolbarKeydown"
    >
      <button
        v-for="(tool, index) in tools"
        :key="tool.id"
        type="button"
        :title="tool.title"
        :tabindex="index === focusedIndex ? 0 : -1"
        :aria-pressed="tool.type === 'toggle' ? tool.isActive() : undefined"
        :aria-disabled="tool.type === 'action' ? !tool.canRun() : undefined"
        @focus="focusedIndex = index"
        @click="activate(tool)"
      >
        {{ tool.label }}
      </button>
    </div>

    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps({
  labelledby: { type: String, required: true },
  // Only used to give each toolbar a distinct accessible name. Without it
  // both editors' toolbars would announce as "Text formatting", so a
  // screen reader user listing the page's controls couldn't tell which
  // side they belong to.
  fieldName: { type: String, default: '' },
  modelValue: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update:modelValue']);

const toolbarLabel = computed(() =>
  props.fieldName ? `${props.fieldName} text formatting` : 'Text formatting',
);

// Restricted to exactly what the toolbar exposes. StarterKit otherwise
// registers headings, blockquote, code, strike, horizontal rule and links,
// all of which have markdown-style input rules - typing "# " or "> " would
// silently create content the toolbar never offered and the preview never
// styles. Disabling them keeps "what you can make" and "what you can see
// and control" the same set.
//
// Kept deliberately: listItem and listKeymap (bulletList depends on them),
// hardBreak, undoRedo, dropcursor, gapcursor.
const editor = new Editor({
  extensions: [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      strike: false,
      horizontalRule: false,
      orderedList: false,
      link: false,
      underline: false,
    }),
  ],
  content: props.modelValue,
  editorProps: {
    attributes: { role: 'textbox', 'aria-labelledby': props.labelledby, 'aria-multiline': 'true' },
  },
  onUpdate: ({ editor: currentEditor }) => {
    emit('update:modelValue', currentEditor.getHTML());
  },
});

// Every command is wrapped in .focus() so clicking a toolbar button puts
// the caret back where it was - otherwise the selection is lost and the
// formatting appears to apply to nothing.
//
// Two kinds of control, which need different semantics:
//   toggle - a state you are in or out of  -> aria-pressed
//   action - a thing that happens once     -> aria-disabled when unavailable
// Undo and redo are actions, so they never get aria-pressed.
const tools = [
  {
    id: 'paragraph',
    type: 'toggle',
    label: 'Paragraph',
    title: 'Paragraph',
    run: () => editor.chain().focus().setParagraph().run(),
    isActive: () => editor.isActive('paragraph'),
  },
  {
    id: 'bold',
    type: 'toggle',
    label: 'Bold',
    title: 'Bold (⌘B / Ctrl+B)',
    run: () => editor.chain().focus().toggleBold().run(),
    isActive: () => editor.isActive('bold'),
  },
  {
    id: 'italic',
    type: 'toggle',
    label: 'Italic',
    title: 'Italic (⌘I / Ctrl+I)',
    run: () => editor.chain().focus().toggleItalic().run(),
    isActive: () => editor.isActive('italic'),
  },
  {
    id: 'bulletList',
    type: 'toggle',
    label: 'Bulleted list',
    title: 'Bulleted list',
    run: () => editor.chain().focus().toggleBulletList().run(),
    isActive: () => editor.isActive('bulletList'),
  },
  {
    id: 'undo',
    type: 'action',
    label: 'Undo',
    title: 'Undo (⌘Z / Ctrl+Z)',
    run: () => editor.chain().focus().undo().run(),
    canRun: () => editor.can().undo(),
  },
  {
    id: 'redo',
    type: 'action',
    label: 'Redo',
    title: 'Redo (⇧⌘Z / Ctrl+Y)',
    run: () => editor.chain().focus().redo().run(),
    canRun: () => editor.can().redo(),
  },
];

function activate(tool) {
  // aria-disabled (unlike the disabled attribute) does not stop the click,
  // so the guard has to be here.
  if (tool.type === 'action' && !tool.canRun()) return;
  tool.run();
}

// --- Roving tabindex ------------------------------------------------------
// role="toolbar" is a promise to the user that the group behaves as one
// tab stop with arrow keys moving inside it. Six buttons per editor, two
// editors, would otherwise be twelve tab stops between the heading and the
// text you actually came to type.
const toolbarEl = ref(null);
const focusedIndex = ref(0);

function focusTool(index) {
  // Wrap around at both ends.
  const next = (index + tools.length) % tools.length;
  focusedIndex.value = next;
  toolbarEl.value?.querySelectorAll('button')[next]?.focus();
}

function onToolbarKeydown(event) {
  const moves = {
    ArrowRight: () => focusTool(focusedIndex.value + 1),
    ArrowLeft: () => focusTool(focusedIndex.value - 1),
    Home: () => focusTool(0),
    End: () => focusTool(tools.length - 1),
  };
  const move = moves[event.key];
  if (!move) return;
  event.preventDefault(); // stop Home/End scrolling the page
  move();
}

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
  flex-wrap: wrap;
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

/* The editor itself is the focus target, so give it a visible ring - the
   contenteditable div gets no default outline treatment we can rely on. */
.editor-content :deep(.tiptap:focus-visible) {
  outline: 2px solid #2e74b5;
  outline-offset: -2px;
}
</style>
