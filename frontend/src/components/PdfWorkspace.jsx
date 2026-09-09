import {
  FileDown,
  FileText,
  Loader2,
  MessageCircleQuestion,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import api from "../../utils/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

function PdfWorkspace({ onClose }) {
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [question, setQuestion] = useState("");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [credits, setCredits] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/agent/pdf/documents")
      .then(({ data }) => {
        setDocuments(data.documents || []);
        setCredits(data.credits ?? null);
      })
      .catch((requestError) => {
        setError(getErrorMessage(requestError, "Unable to load PDF documents."));
      });
  }, []);

  const uploadPdf = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }

    try {
      setBusy("upload");
      setError("");
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post("/api/agent/pdf/documents", body);
      setDocuments((current) => [data.document, ...current]);
      setCredits(data.credits ?? credits);
      setSelectedIds((current) => [...current, data.document._id]);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to upload this PDF."));
    } finally {
      setBusy("");
    }
  };

  const askPdf = async () => {
    if (!question.trim()) return;

    try {
      setBusy("ask");
      setError("");
      const { data } = await api.post("/api/agent/pdf/rag/ask", {
        prompt: question.trim(),
        documentIds: selectedIds,
      });
      setAnswer(data.answer || "No answer returned.");
      setCitations(data.citations || []);
      setCredits(data.credits ?? credits);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to ask the PDF assistant."));
    } finally {
      setBusy("");
    }
  };

  const generatePdf = async () => {
    if (!generationPrompt.trim()) return;

    try {
      setBusy("generate");
      setError("");
      const { data } = await api.post("/api/agent/pdf/generate", {
        prompt: generationPrompt.trim(),
      });
      setDownloadUrl(data.downloadUrl || `${import.meta.env.VITE_SERVER_URL}/api/agent${data.downloadPath}`);
      setCredits(data.credits ?? credits);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to generate the PDF."));
    } finally {
      setBusy("");
    }
  };

  const toggleDocument = (documentId) => {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId]
    );
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-6">
      <section className="flex max-h-[min(760px,calc(100vh-24px))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#11151d] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-100">PDF Studio</h2>
              <p className="text-xs text-slate-500">Ask your documents or create a new PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {credits !== null && <span className="text-xs text-slate-500">{credits} credits</span>}
            <button type="button" aria-label="Close PDF Studio" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-slate-500 hover:bg-white/[0.06] hover:text-slate-200">
              <X size={17} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-white/[0.07] p-4 lg:border-b-0 lg:border-r">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={Boolean(busy)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-semibold text-[#17130b] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
              {busy === "upload" ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Upload PDF
            </button>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={uploadPdf} />

            <p className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Your documents</p>
            <div className="space-y-1.5">
              {documents.length === 0 && <p className="text-xs leading-relaxed text-slate-600">Upload a PDF to start asking questions.</p>}
              {documents.map((document) => {
                const selected = selectedIds.includes(document._id);
                return (
                  <button key={document._id} type="button" onClick={() => toggleDocument(document._id)} className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left ${selected ? "border-amber-300/30 bg-amber-300/10" : "border-transparent hover:bg-white/[0.05]"}`}>
                    <FileText size={14} className={selected ? "text-amber-300" : "text-slate-500"} />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-300">{document.originalName}</span>
                    <span className={`text-[10px] ${document.status === "ready" ? "text-emerald-400" : "text-slate-600"}`}>{document.status}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
            <div className="flex min-h-[260px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><MessageCircleQuestion size={16} className="text-amber-300" /> PDF RAG Assistant</div>
              <p className="mt-1 text-xs text-slate-500">Select documents, then ask questions grounded in their content.</p>
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What are the key findings?" className="mt-4 min-h-24 flex-1 resize-none rounded-lg border border-white/[0.08] bg-black/15 p-3 text-xs leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-300/40" />
              <button type="button" disabled={!question.trim() || Boolean(busy)} onClick={askPdf} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-40">
                {busy === "ask" && <Loader2 size={14} className="animate-spin" />} Ask assistant
              </button>
              {answer && <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/15 p-3 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{answer}</div>}
              {citations.length > 0 && <div className="mt-3 space-y-1 text-[10px] text-slate-500">{citations.map((citation) => <p key={`${citation.documentId}-${citation.index}`}>[{citation.index}] {citation.documentName}, page {citation.page}</p>)}</div>}
            </div>

            <div className="flex min-h-[260px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><FileDown size={16} className="text-amber-300" /> PDF Generator</div>
              <p className="mt-1 text-xs text-slate-500">Describe a report, brief, guide, or other document to generate.</p>
              <textarea value={generationPrompt} onChange={(event) => setGenerationPrompt(event.target.value)} placeholder="Create a one-page project brief..." className="mt-4 min-h-24 flex-1 resize-none rounded-lg border border-white/[0.08] bg-black/15 p-3 text-xs leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-300/40" />
              <button type="button" disabled={!generationPrompt.trim() || Boolean(busy)} onClick={generatePdf} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-[#17130b] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">
                {busy === "generate" && <Loader2 size={14} className="animate-spin" />} Generate PDF
              </button>
              {downloadUrl && <a href={downloadUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-400/15"><FileDown size={14} /> Download generated PDF</a>}
            </div>

            {error && <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200 md:col-span-2">{error}</div>}
          </main>
        </div>
      </section>
    </div>
  );
}

export default PdfWorkspace;
