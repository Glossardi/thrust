/** @jsxImportSource hono/jsx/dom */
import { hc } from "hono/client";
import { render } from "hono/jsx/dom";
import { useState } from "hono/jsx";
import type { NoteFilter } from "./notes";
import type { NoteRecord } from "./notes";
import type { NotesApiType } from "./notes";

const client = hc<NotesApiType>("/notes/api");

type NotesIslandProps = {
  initialNotes: NoteRecord[],
  initialFilter: NoteFilter,
};

function trimContent(content: string) {
  if (content.length <= 120) return content;
  return `${content.slice(0, 117)}...`;
}

function NotesIsland({ initialNotes, initialFilter }: NotesIslandProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [filter, setFilter] = useState<NoteFilter>(initialFilter);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"general" | "work" | "personal">("general");
  const [saving, setSaving] = useState(false);
  const [busyNoteId, setBusyNoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadNotes(nextFilter: NoteFilter) {
    const res = await client.filter.$get({ query: { category: nextFilter } });
    const data = await res.json();
    if (res.ok) {
      setNotes(data.notes);
      setError(null);
      return;
    }

    setError("Could not load notes.");
  }

  async function createNote() {
    setSaving(true);
    setError(null);

    const res = await client.index.$post({
      json: { title, content, category },
    });

    if (res.status === 201) {
      setTitle("");
      setContent("");
      await loadNotes(filter);
      setSaving(false);
      return;
    }

    const data = await res.json();
    setError(data.error ?? "Could not create note.");
    setSaving(false);
  }

  async function togglePin(id: number) {
    setBusyNoteId(id);
    setError(null);

    const res = await client[":id"].pin.$patch({
      param: { id: String(id) },
    });

    if (res.ok) {
      await loadNotes(filter);
    } else {
      const data = await res.json();
      setError(data.error ?? "Could not update note.");
    }

    setBusyNoteId(null);
  }

  async function deleteNote(id: number) {
    setBusyNoteId(id);
    setError(null);

    const res = await client[":id"].$delete({
      param: { id: String(id) },
    });

    if (res.ok) {
      await loadNotes(filter);
    } else {
      const data = await res.json();
      setError(data.error ?? "Could not delete note.");
    }

    setBusyNoteId(null);
  }

  return (
    <div class="grid gap-8 lg:grid-cols-[20rem,1fr]">
      <section class="card bg-base-200 shadow-sm">
        <div class="card-body space-y-5">
          <div>
            <h2 class="card-title text-xl">Create note</h2>
            <p class="text-sm text-base-content/60">Typed RPC and local island state.</p>
          </div>

          <form
            class="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void createNote();
            }}
          >
            <label class="form-control gap-2">
              <span class="label-text font-medium">Title</span>
              <input
                aria-label="Title"
                class="input input-bordered"
                value={title}
                onInput={(event) => setTitle(event.currentTarget.value)}
                placeholder="Ship the reference feature"
              />
            </label>

            <label class="form-control gap-2">
              <span class="label-text font-medium">Content</span>
              <textarea
                aria-label="Content"
                class="textarea textarea-bordered min-h-28"
                value={content}
                onInput={(event) => setContent(event.currentTarget.value)}
                placeholder="What needs to happen next?"
              />
            </label>

            <label class="form-control gap-2">
              <span class="label-text font-medium">Category</span>
              <select
                aria-label="Category"
                class="select select-bordered"
                value={category}
                onChange={(event) => setCategory(event.currentTarget.value as typeof category)}
              >
                <option value="general">General</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
              </select>
            </label>

            <button class="btn btn-primary w-full" disabled={saving} type="submit">
              {saving ? "Creating note..." : "Create note"}
            </button>
          </form>

          {error ? <div class="alert alert-error text-sm">{error}</div> : null}
        </div>
      </section>

      <section class="space-y-5">
        <div class="flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="text-xl font-semibold">Notes</h2>
            <p class="text-sm text-base-content/60">Pinned notes always stay on top.</p>
          </div>

          <label class="form-control gap-2 md:w-56">
            <span class="label-text font-medium">Filter notes</span>
            <select
              aria-label="Filter notes"
              class="select select-bordered"
              value={filter}
              onChange={(event) => {
                const nextFilter = event.currentTarget.value as NoteFilter;
                setFilter(nextFilter);
                void loadNotes(nextFilter);
              }}
            >
              <option value="all">All</option>
              <option value="general">General</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>
          </label>
        </div>

        {notes.length === 0 ? (
          <div class="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-10 text-center text-base-content/60 shadow-sm">
            No notes yet. Create your first one!
          </div>
        ) : (
          <div class="grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <article key={note.id} class={`card border shadow-sm ${note.pinned ? "border-primary bg-primary/5" : "border-base-300 bg-base-100"}`}>
                <div class="card-body gap-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-2">
                      <h3 class="card-title text-lg leading-tight">{note.title}</h3>
                      <div class="flex flex-wrap gap-2">
                        <span class="badge badge-neutral badge-outline">{note.category}</span>
                        {note.pinned ? <span class="badge badge-primary">Pinned</span> : null}
                      </div>
                    </div>
                    <span class="text-xs text-base-content/50">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>

                  <p class="text-sm text-base-content/70">{trimContent(note.content)}</p>

                  <div class="card-actions justify-end">
                    <button
                      class="btn btn-sm btn-outline"
                      disabled={busyNoteId === note.id}
                      onClick={() => void togglePin(note.id)}
                      type="button"
                    >
                      {busyNoteId === note.id ? "Working..." : note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                    </button>
                    <button
                      class="btn btn-sm btn-error btn-outline"
                      disabled={busyNoteId === note.id}
                      onClick={() => void deleteNote(note.id)}
                      type="button"
                    >
                      {busyNoteId === note.id ? "Working..." : `Delete ${note.title}`}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function mount(rootId: string, propsScriptId: string) {
  const root = document.getElementById(rootId);
  const propsNode = document.getElementById(propsScriptId);

  if (!root || !propsNode) return;

  const props = JSON.parse(propsNode.textContent ?? "null") as NotesIslandProps;
  render(<NotesIsland {...props} />, root);
}
