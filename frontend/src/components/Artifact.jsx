import {
  Check,
  Code2,
  Copy,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function Artifact() {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("code");
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // -----------------------------------------
  // Redux
  // -----------------------------------------

  const artifacts = useSelector(
    (state) => state?.message?.artifacts || []
  );

  // -----------------------------------------
  // No artifacts
  // -----------------------------------------

  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    return null;
  }

  const artifact = artifacts[0];

  // -----------------------------------------
  // Make sure files is an array
  // -----------------------------------------

  const files = Array.isArray(artifact?.files)
    ? artifact.files
    : [];

  if (files.length === 0) {
    return null;
  }

  // -----------------------------------------
  // Safe active file
  // -----------------------------------------

  const safeActiveFile =
    activeFile >= 0 && activeFile < files.length
      ? activeFile
      : 0;

  const file = files[safeActiveFile];

  // -----------------------------------------
  // Find preview files
  // -----------------------------------------

  const htmlFile = files.find(
    (f) =>
      f?.name?.toLowerCase() === "index.html"
  );

  const cssFile = files.find(
    (f) =>
      f?.name?.toLowerCase() === "style.css"
  );

  const jsFile = files.find(
    (f) =>
      f?.name?.toLowerCase() === "script.js"
  );

  const canPreview = Boolean(htmlFile);

  const getLanguage = (fileName = "") => {
    const cleanName = fileName.toLowerCase();

    if (cleanName.includes("package.json")) return "json";
    if (cleanName.endsWith(".tsx")) return "tsx";
    if (cleanName.endsWith(".ts")) return "typescript";
    if (cleanName.endsWith(".jsx")) return "jsx";
    if (cleanName.endsWith(".js")) return "javascript";
    if (cleanName.endsWith(".css")) return "css";
    if (cleanName.endsWith(".html")) return "html";
    if (cleanName.endsWith(".json")) return "json";
    if (cleanName.endsWith(".md")) return "markdown";
    if (cleanName.endsWith(".yml") || cleanName.endsWith(".yaml")) return "yaml";
    if (cleanName.endsWith(".py")) return "python";
    if (cleanName.endsWith(".sh")) return "bash";
    if (cleanName.endsWith(".sql")) return "sql";

    const ext = cleanName.split(".").pop();
    return ext || "text";
  };

  const previewDoc = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <style>
    ${cssFile?.content || ""}
  </style>
</head>

<body>

  ${htmlFile?.content || ""}

  <script>
    ${jsFile?.content || ""}
  </script>

</body>

</html>
`;

  // -----------------------------------------
  // Copy
  // -----------------------------------------

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        file?.content || ""
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy:",
        error
      );
    }
  };

  // -----------------------------------------
  // Panel Content
  // -----------------------------------------

  const PanelContent = ({ onClose }) => {
    if (collapsed && !onClose) {
      return (
        <div
          className="
            hidden
            lg:flex
            h-full
            bg-[#0d0f14]
            border-l
            border-white/[0.06]
            flex-col
            items-center
            py-4
            gap-3
          "
        >

          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="
              flex
              items-center
              justify-center
              w-7
              h-7
              rounded-lg
              text-slate-500
              hover:text-slate-200
              hover:bg-white/[0.05]
              bg-transparent
              border-none
              cursor-pointer
            "
          >
            <PanelRightOpen size={16} />
          </button>

          <div className="flex-1 flex items-center">

            <div
              className="
                text-[10px]
                font-medium
                text-slate-600
                tracking-widest
                uppercase
                whitespace-nowrap
              "
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
            >
              {artifact?.title || "Artifact"}
            </div>

          </div>

        </div>
      );
    }

    return (
      <div
        className="
          flex
          flex-col
          h-full
          bg-[#0d0f14]
        "
      >

        {/* =================================
            HEADER
        ================================= */}

        <div
          className="
            h-14
            px-4
            border-b
            border-white/[0.06]
            flex
            items-center
            gap-3
            shrink-0
          "
        >

          {/* Close / Collapse */}

          <button
            type="button"
            onClick={
              onClose
                ? onClose
                : () => setCollapsed(true)
            }
            className="
              flex
              items-center
              justify-center
              w-7
              h-7
              rounded-lg
              text-slate-500
              hover:text-slate-200
              hover:bg-white/[0.05]
              bg-transparent
              border-none
              cursor-pointer
              shrink-0
            "
          >
            {onClose ? (
              <X size={15} />
            ) : (
              <PanelRightClose size={16} />
            )}
          </button>

          {/* Title */}

          <div
            className="
              flex
              items-center
              gap-2
              flex-1
              min-w-0
            "
          >

            <div
              className="
                flex
                items-center
                justify-center
                w-6
                h-6
                rounded-md
                bg-indigo-500/10
                border
                border-indigo-500/20
                shrink-0
              "
            >
              <Code2
                size={12}
                className="text-indigo-400"
              />
            </div>

            <div
              className="
                text-[13px]
                font-medium
                text-slate-200
                truncate
              "
            >
              {artifact?.title || "Artifact"}
            </div>

          </div>

          {/* Copy */}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy code"
            className="
              flex
              items-center
              justify-center
              w-7
              h-7
              rounded-lg
              text-slate-500
              hover:text-slate-200
              hover:bg-white/[0.05]
              bg-transparent
              border-none
              cursor-pointer
              shrink-0
            "
          >
            {copied ? (
              <Check size={15} />
            ) : (
              <Copy size={15} />
            )}
          </button>

          {/* Code / Preview */}

          {canPreview && (
            <div
              className="
                flex
                items-center
                gap-1
                bg-white/[0.04]
                border
                border-white/[0.06]
                p-1
                rounded-lg
                shrink-0
              "
            >

              <button
                type="button"
                onClick={() => setTab("code")}
                className={`
                  flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1
                  text-[11px]
                  font-medium
                  rounded-md
                  border-none
                  cursor-pointer
                  ${
                    tab === "code"
                      ? "bg-indigo-500 text-white"
                      : "bg-transparent text-slate-500 hover:text-slate-200"
                  }
                `}
              >
                <Code2 size={11} />
                Code
              </button>

              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`
                  flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1
                  text-[11px]
                  font-medium
                  rounded-md
                  border-none
                  cursor-pointer
                  ${
                    tab === "preview"
                      ? "bg-indigo-500 text-white"
                      : "bg-transparent text-slate-500 hover:text-slate-200"
                  }
                `}
              >
                <Eye size={11} />
                Preview
              </button>

            </div>
          )}

        </div>

        {/* =================================
            FILE TABS
        ================================= */}

        {tab === "code" && (
          <div
            className="
              flex
              border-b
              border-white/[0.06]
              overflow-x-auto
              shrink-0
            "
          >

            {files.map((f, index) => (
              <button
                key={`${f?.name || "file"}-${index}`}
                type="button"
                onClick={() => {
                  setActiveFile(index);
                }}
                className={`
                  px-4
                  py-2.5
                  text-[11px]
                  font-medium
                  whitespace-nowrap
                  border-r
                  border-white/[0.05]
                  relative
                  cursor-pointer
                  bg-transparent
                  border-t-0
                  border-b-0
                  border-l-0

                  ${
                    safeActiveFile === index
                      ? "text-indigo-400"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >

                {f?.name || `File ${index + 1}`}

                {safeActiveFile === index && (
                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      h-[2px]
                      bg-indigo-500
                      rounded-t-full
                    "
                  />
                )}

              </button>
            ))}

          </div>
        )}

        {/* =================================
            CONTENT
        ================================= */}

        <div className="flex-1 overflow-hidden">

          {/* ===============================
              PREVIEW
          =============================== */}

          {tab === "preview" && canPreview ? (
            <iframe
              title="artifact-preview"
              srcDoc={previewDoc}
              sandbox="allow-scripts"
              className="
                w-full
                h-full
                bg-white
                border-none
              "
            />
          ) : (

            /* =============================
               CODE
            ============================= */

            <div
              className="
                w-full
                h-full
                overflow-auto
                bg-[#0d0f14]
              "
            >
              <SyntaxHighlighter
                language={getLanguage(file?.name || "")}
                style={vscDarkPlus}
                showLineNumbers={true}
                wrapLongLines={false}
                customStyle={{
                  margin: 0,
                  minHeight: "100%",
                  background: "transparent",
                  padding: "18px",
                  fontSize: "12.5px",
                  lineHeight: "1.7",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
                  },
                }}
              >
                {file?.content || "// No code available"}
              </SyntaxHighlighter>
            </div>
          )}

        </div>

      </div>
    );
  };

  // =========================================
  // RETURN
  // =========================================

  return (
    <>
      {/* =====================================
          MOBILE BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="
          lg:hidden
          fixed
          bottom-24
          right-4
          z-40
          flex
          items-center
          gap-2
          px-3.5
          py-2
          rounded-xl
          bg-indigo-600
          hover:bg-indigo-500
          text-white
          text-[12px]
          font-medium
          shadow-lg
          border-none
          cursor-pointer
        "
      >
        <Code2 size={13} />
        View Code
      </button>

      {/* =====================================
          MOBILE PANEL
      ====================================== */}

      {mobileOpen && (
        <>
          {/* Overlay */}

          <div
            onClick={() => setMobileOpen(false)}
            className="
              lg:hidden
              fixed
              inset-0
              z-50
              bg-black/60
              backdrop-blur-sm
            "
          />

          {/* Panel */}

          <div
            className="
              lg:hidden
              fixed
              inset-y-0
              right-0
              z-50
              w-[88vw]
              max-w-[420px]
              border-l
              border-white/[0.06]
              overflow-hidden
            "
          >
            <PanelContent
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* =====================================
          DESKTOP PANEL
      ====================================== */}

      <div
        className="
          hidden
          lg:flex
          h-full
          border-l
          border-white/[0.06]
          flex-col
          overflow-hidden
          shrink-0
        "
        style={{
          width: collapsed ? "48px" : "400px",
          transition: "width 250ms ease",
        }}
      >
        <PanelContent />
      </div>
    </>
  );
}

export default Artifact;