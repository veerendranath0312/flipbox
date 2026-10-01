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
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { Editor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"

const props = defineProps({
  labelledby: { type: String, required: true },
  // Gives each toolbar a distinct accessible name, so the two editors are
  // distinguishable when listing the page's controls.
  fieldName: { type: String, default: "" },
  modelValue: {
    type: String,
    default: "",
  },
})
const emit = defineEmits(["update:modelValue"])

const toolbarLabel = computed(() =>
  props.fieldName ? `${props.fieldName} text formatting` : "Text formatting",
)

// Restricted to what the toolbar exposes. The disabled extensions all have
// markdown input rules, so leaving them on would let "# " or "> " create
// content the toolbar never offered and the preview never styles.
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
    attributes: {
      role: "textbox",
      "aria-labelledby": props.labelledby,
      "aria-multiline": "true",
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    emit("update:modelValue", currentEditor.getHTML())
  },
})

// Toggles get aria-pressed, one-shot actions get aria-disabled. The
// .focus() in each chain returns the caret to the document, so clicking a
// button doesn't drop the selection.
const tools = [
  {
    id: "paragraph",
    type: "toggle",
    label: "Paragraph",
    title: "Paragraph",
    run: () => editor.chain().focus().setParagraph().run(),
    isActive: () => editor.isActive("paragraph"),
  },
  {
    id: "bold",
    type: "toggle",
    label: "Bold",
    title: "Bold (⌘B / Ctrl+B)",
    run: () => editor.chain().focus().toggleBold().run(),
    isActive: () => editor.isActive("bold"),
  },
  {
    id: "italic",
    type: "toggle",
    label: "Italic",
    title: "Italic (⌘I / Ctrl+I)",
    run: () => editor.chain().focus().toggleItalic().run(),
    isActive: () => editor.isActive("italic"),
  },
  {
    id: "bulletList",
    type: "toggle",
    label: "Bulleted list",
    title: "Bulleted list",
    run: () => editor.chain().focus().toggleBulletList().run(),
    isActive: () => editor.isActive("bulletList"),
  },
  {
    id: "undo",
    type: "action",
    label: "Undo",
    title: "Undo (⌘Z / Ctrl+Z)",
    run: () => editor.chain().focus().undo().run(),
    canRun: () => editor.can().undo(),
  },
  {
    id: "redo",
    type: "action",
    label: "Redo",
    title: "Redo (⇧⌘Z / Ctrl+Y)",
    run: () => editor.chain().focus().redo().run(),
    canRun: () => editor.can().redo(),
  },
]

function activate(tool) {
  // aria-disabled doesn't block the click the way disabled would.
  if (tool.type === "action" && !tool.canRun()) return
  tool.run()
}

// Roving tabindex: role="toolbar" means one tab stop for the group, with
// arrow keys moving between the buttons inside it.
const toolbarEl = ref(null)
const focusedIndex = ref(0)

function focusTool(index) {
  const next = (index + tools.length) % tools.length
  focusedIndex.value = next
  toolbarEl.value?.querySelectorAll("button")[next]?.focus()
}

function onToolbarKeydown(event) {
  const moves = {
    ArrowRight: () => focusTool(focusedIndex.value + 1),
    ArrowLeft: () => focusTool(focusedIndex.value - 1),
    Home: () => focusTool(0),
    End: () => focusTool(tools.length - 1),
  }
  const move = moves[event.key]
  if (!move) return
  event.preventDefault()
  move()
}

// Syncs the editor when modelValue changes from outside, e.g. restored
// from storage. The comparison is what stops this looping with onUpdate.
watch(
  () => props.modelValue,
  (value) => {
    const isSame = value === editor.getHTML()
    if (!isSame) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  },
)

onBeforeUnmount(() => {
  editor.destroy()
})

defineExpose({ editor })
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

/* Flex so the editable area fills this box; otherwise it is only as tall
   as its text and the rest of the box is dead to clicks. */
.editor-content {
  display: flex;
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
  flex: 1;
  overflow-wrap: anywhere;
}

.editor-content :deep(pre) {
  white-space: pre-wrap;
}

/* Focus shows on the whole editor rather than the editable area, where an
   outline reads as a stray input box inside the card. */
.editor-content :deep(.tiptap:focus-visible) {
  outline: none;
}

.rich-text-editor:focus-within {
  border-color: #2e74b5;
  box-shadow: 0 0 0 3px rgba(46, 116, 181, 0.25);
}
</style>
