import type { FC } from "hono/jsx";

type IslandProps = {
  entry: string,
  id?: string,
  props?: unknown,
};

function toIslandModulePath(entry: string) {
  const normalized = entry
    .replace(/^\/+/, "")
    .replace(/^static\/islands\//, "")
    .replace(/^islands\//, "");

  return normalized.endsWith(".js")
    ? `/static/islands/${normalized}`
    : `/static/islands/${normalized}.js`;
}

function toMountId(entry: string, id?: string) {
  if (id) return id;
  return `island-${entry.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
}

function serializeProps(value: unknown) {
  return JSON.stringify(value ?? null).replace(/[<>&\u2028\u2029]/g, (char) => {
    switch (char) {
      case "<":
        return "\\u003c";
      case ">":
        return "\\u003e";
      case "&":
        return "\\u0026";
      case "\u2028":
        return "\\u2028";
      case "\u2029":
        return "\\u2029";
      default:
        return char;
    }
  });
}

const Island: FC<IslandProps> = ({ entry, id, props }) => {
  const mountId = toMountId(entry, id);
  const propsScriptId = `${mountId}-props`;
  const modulePath = toIslandModulePath(entry);
  const bootstrap = [
    `import mount from ${JSON.stringify(modulePath)};`,
    `mount(${JSON.stringify(mountId)}, ${JSON.stringify(propsScriptId)});`,
  ].join("\n");

  return (
    <>
      <div id={mountId}></div>
      <script
        id={propsScriptId}
        type="application/json"
        dangerouslySetInnerHTML={{ __html: serializeProps(props) }}
      />
      <script type="module" dangerouslySetInnerHTML={{ __html: bootstrap }} />
    </>
  );
};

export { Island };
