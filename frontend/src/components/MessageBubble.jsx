import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  X,
  Copy,
  Check,
  Bot,
  User,
  ImageIcon,
} from "lucide-react";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";


/* =========================================================
   COPY BUTTON
========================================================= */

function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5
        rounded-lg
        px-2.5 py-1.5
        text-[11px] font-medium
        text-slate-400
        hover:text-white
        hover:bg-white/[0.08]
        transition-all
        duration-200
        cursor-pointer
        ${className}
      `}
    >
      {copied ? (
        <>
          <Check
            size={14}
            className="text-emerald-400"
          />

          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} />

          <span>Copy</span>
        </>
      )}
    </button>
  );
}


/* =========================================================
   CODE BLOCK
========================================================= */

function CodeBlock({
  children,
  className,
}) {
  const match = /language-(\w+)/.exec(
    className || ""
  );

  const language = match
    ? match[1]
    : "text";

  const code = String(children).replace(
    /\n$/,
    ""
  );

  return (
    <div
      className="
        my-5
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.08]
        bg-[#090b10]
        shadow-2xl
        shadow-black/20
      "
    >
      {/* Header */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-white/[0.07]
          bg-white/[0.025]
          px-4
          py-2.5
        "
      >
        <div className="flex items-center gap-2">
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-indigo-400
              shadow-[0_0_12px_rgba(129,140,248,0.8)]
            "
          />

          <span
            className="
              font-mono
              text-[11px]
              font-medium
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            {language}
          </span>
        </div>

        <CopyButton text={code} />
      </div>


      {/* Code */}

      <div
        className="
          max-h-[600px]
          overflow-auto
        "
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: "18px",
            background: "transparent",
            fontSize: "12px",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "JetBrains Mono, Fira Code, Consolas, monospace",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}


/* =========================================================
   IMAGE GALLERY
========================================================= */

function ImageGallery({
  images = [],
  onImageClick,
}) {
  if (!images?.length) return null;

  return (
    <div
      className="
        mt-4
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-2
      "
    >
      {images.map((img, index) => {
        const imageUrl =
          typeof img === "string"
            ? img
            : img?.url ||
              img?.src ||
              img?.image;

        if (!imageUrl) return null;

        return (
          <button
            key={`${imageUrl}-${index}`}
            type="button"
            onClick={() =>
              onImageClick(imageUrl)
            }
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.08]
              bg-black/20
              text-left
              cursor-pointer
            "
          >
            <img
              src={imageUrl}
              alt={`Result ${index + 1}`}
              loading="lazy"
              className="
                h-48
                w-full
                object-cover
                transition-all
                duration-300
                group-hover:scale-[1.04]
                group-hover:brightness-75
              "
            />

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/0
                opacity-0
                transition-all
                duration-200
                group-hover:bg-black/20
                group-hover:opacity-100
              "
            >
              <div
                className="
                  rounded-full
                  border
                  border-white/10
                  bg-black/50
                  p-3
                  backdrop-blur-md
                "
              >
                <ImageIcon
                  size={18}
                  className="text-white"
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


/* =========================================================
   MESSAGE CONTENT
========================================================= */

function MessageContent({
  content,
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1
            className="
              mb-4
              mt-6
              text-2xl
              font-bold
              tracking-tight
              text-white
            "
          >
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2
            className="
              mb-3
              mt-6
              text-xl
              font-semibold
              tracking-tight
              text-white
            "
          >
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3
            className="
              mb-2
              mt-5
              text-lg
              font-semibold
              text-slate-100
            "
          >
            {children}
          </h3>
        ),

        p: ({ children }) => (
          <p
            className="
              mb-4
              whitespace-pre-wrap
              break-words
              leading-7
            "
          >
            {children}
          </p>
        ),

        ul: ({ children }) => (
          <ul
            className="
              my-4
              list-disc
              space-y-2
              pl-6
            "
          >
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol
            className="
              my-4
              list-decimal
              space-y-2
              pl-6
            "
          >
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li
            className="
              pl-1
              marker:text-indigo-400
            "
          >
            {children}
          </li>
        ),

        strong: ({ children }) => (
          <strong
            className="
              font-semibold
              text-white
            "
          >
            {children}
          </strong>
        ),

        table: ({ children }) => (
          <div
            className="
              my-5
              w-full
              overflow-x-auto
              rounded-xl
              border
              border-white/[0.08]
            "
          >
            <table
              className="
                min-w-full
                border-collapse
              "
            >
              {children}
            </table>
          </div>
        ),

        thead: ({ children }) => (
          <thead
            className="
              bg-white/[0.06]
            "
          >
            {children}
          </thead>
        ),

        th: ({ children }) => (
          <th
            className="
              border-b
              border-r
              border-white/[0.07]
              px-4
              py-3
              text-left
              text-xs
              font-semibold
              text-slate-200
              last:border-r-0
            "
          >
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td
            className="
              border-r
              border-white/[0.06]
              px-4
              py-3
              text-sm
              text-slate-300
              last:border-r-0
            "
          >
            {children}
          </td>
        ),

        code: ({
          inline,
          className,
          children,
          ...props
        }) => {
          if (inline) {
            return (
              <code
                className="
                  rounded-md
                  border
                  border-indigo-400/10
                  bg-indigo-500/10
                  px-1.5
                  py-0.5
                  font-mono
                  text-[12px]
                  text-indigo-200
                "
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <CodeBlock
              className={className}
            >
              {children}
            </CodeBlock>
          );
        },

        pre: ({ children }) => (
          <>{children}</>
        ),

        blockquote: ({ children }) => (
          <blockquote
            className="
              my-5
              border-l-2
              border-indigo-400
              bg-indigo-500/[0.04]
              py-2
              pl-5
              pr-4
              text-slate-300
            "
          >
            {children}
          </blockquote>
        ),

        a: ({
          children,
          href,
        }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="
              font-medium
              text-indigo-400
              underline
              underline-offset-4
              transition
              hover:text-indigo-300
              break-all
            "
          >
            {children}
          </a>
        ),

        hr: () => (
          <hr
            className="
              my-6
              border-white/[0.08]
            "
          />
        ),
      }}
    >
      {content || ""}
    </Markdown>
  );
}


/* =========================================================
   MAIN MESSAGE BUBBLE
========================================================= */

function MessageBubble({
  role,
  content,
  images = [],
}) {
  const isUser =
    role === "user";

  const [lightBox, setLightBox] =
    useState(null);

  return (
    <>
      <div
        className={`
          group
          flex
          w-full
          gap-3
          ${
            isUser
              ? "justify-end"
              : "justify-start"
          }
        `}
      >

        {/* Assistant Avatar */}

        {!isUser && (
          <div
            className="
              mt-1
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-indigo-400/20
              bg-indigo-500/10
              shadow-[0_0_25px_rgba(99,102,241,0.08)]
            "
          >
            <Bot
              size={16}
              className="text-indigo-300"
            />
          </div>
        )}


        {/* Message */}

        <div
          className={`
            relative
            min-w-0
            break-words

            ${
              isUser
                ? `
                  max-w-[85%]
                  rounded-2xl
                  rounded-tr-md
                  bg-linear-to-br
                  from-indigo-500
                  via-violet-600
                  to-purple-700
                  px-4
                  py-3
                  text-white
                  shadow-lg
                  shadow-indigo-950/20
                `
                : `
                  w-fit
                  max-w-[min(100%,900px)]
                  rounded-2xl
                  rounded-tl-md
                  border
                  border-white/[0.07]
                  bg-white/[0.035]
                  px-5
                  py-4
                  text-slate-300
                  shadow-xl
                  shadow-black/10
                  backdrop-blur-sm
                `
            }
          `}
        >

          {/* User Message */}

          {isUser && (
            <div
              className="
                whitespace-pre-wrap
                break-words
                text-[13.5px]
                leading-7
              "
            >
              {content}
            </div>
          )}


          {/* Assistant Markdown */}

          {!isUser && (
            <MessageContent
              content={content}
            />
          )}


          {/* Images */}

          <ImageGallery
            images={images}
            onImageClick={setLightBox}
          />

        </div>


        {/* User Avatar */}

        {isUser && (
          <div
            className="
              mt-1
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.06]
            "
          >
            <User
              size={15}
              className="text-slate-300"
            />
          </div>
        )}

      </div>


      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {lightBox && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/85
            p-4
            backdrop-blur-xl
          "
          onClick={() =>
            setLightBox(null)
          }
        >

          {/* Close */}

          <button
            type="button"
            onClick={() =>
              setLightBox(null)
            }
            className="
              absolute
              right-5
              top-5
              z-10
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/10
              text-white
              backdrop-blur-xl
              transition
              hover:scale-105
              hover:bg-white/20
              cursor-pointer
            "
            aria-label="Close image"
          >
            <X size={20} />
          </button>


          {/* Image */}

          <img
            src={lightBox}
            alt="Full screen preview"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              max-h-[88vh]
              max-w-[92vw]
              rounded-2xl
              border
              border-white/10
              object-contain
              shadow-2xl
            "
          />

        </div>
      )}
    </>
  );
}


export default MessageBubble;