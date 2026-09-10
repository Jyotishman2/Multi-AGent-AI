import { useCallback, useEffect, useState } from "react";
import {
    Crown,
    FileText,
    LogOut,
    Menu,
    MessageSquare,
    PanelLeftIcon,
    PanelRight,
    PenSquare,
    Plus,
    User,
    X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { getConversations } from "../features/getConversation.js";
import {
    addConversation,
    setConversations,
    setSelectedConversation,
} from "../redux/conversationSlice.js";
import { createConversation } from "../features/createConversation.js";
import logOut from "../features/logOut.js";
import PlanModal from "./PlanModal.jsx";
import PdfWorkspace from "./PdfWorkspace.jsx";

function SideBar() {
    const [collapsed, setCollapsed] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [planOpen, setPlanOpen] = useState(false);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState("free");

    const dispatch = useDispatch();

    const { conversations, selectedConversation } = useSelector(
        (state) => state.conversation
    );

    const { userData } = useSelector((state) => state.user);

    const handlePlanUpdated = useCallback((plan) => {
        setCurrentPlan(plan);
    }, []);

    useEffect(() => {
        const getConv = async () => {
            const data = await getConversations();

            if (Array.isArray(data)) {
                dispatch(setConversations(data));
            }
        };

        getConv();
    }, [userData?._id, dispatch]);

    const handleCreateConversation = async () => {
        const data = await createConversation();

        if (data) {
            dispatch(addConversation(data));
            dispatch(setSelectedConversation(data));
        }
    };

    if (collapsed) {
        return (
            <>
                <div className="hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-1 shrink-0">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1"
                    onClick={() => setCollapsed(false)}
                >
                    <PanelRight size={18} />
                </button>

                <button
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                    onClick={handleCreateConversation}
                >
                    <Plus size={17} />
                </button>

                <button
                    type="button"
                    aria-label="View plans"
                    title="View plans"
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-indigo-300 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                    onClick={() => setPlanOpen(true)}
                >
                    <Crown size={16} />
                </button>

                <button
                    type="button"
                    aria-label="Open PDF Studio"
                    title="PDF Studio"
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-amber-300 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                    onClick={() => setPdfOpen(true)}
                >
                    <FileText size={16} />
                </button>

                <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-5">
                    {conversations?.map((conv) => {
                        const isActive =
                            selectedConversation?._id === conv?._id;

                        return (
                            <div
                                key={conv?._id}
                                onClick={() =>
                                    dispatch(setSelectedConversation(conv))
                                }
                                className={`flex items-center justify-center cursor-pointer mb-1 px-2 py-2 rounded-[10px] border transition-colors duration-150 ${
                                    isActive
                                        ? "bg-indigo-500/10 border-indigo-500/[0.18]"
                                        : "bg-transparent border-transparent hover:bg-white/[0.04]"
                                }`}
                            >
                                <MessageSquare
                                    size={15}
                                    className={
                                        isActive
                                            ? "text-indigo-400"
                                            : "text-slate-500"
                                    }
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="relative shrink-0">
                    {userData?.avatar && !imageError ? (
                        <img
                            className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                            src={userData.avatar}
                            alt="user"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center">
                            <User size={15} className="text-slate-400" />
                        </div>
                    )}
                </div>
                </div>
                {planOpen && (
                    <PlanModal
                        onClose={() => setPlanOpen(false)}
                        onPlanUpdated={handlePlanUpdated}
                    />
                )}
                {pdfOpen && <PdfWorkspace onClose={() => setPdfOpen(false)} />}
            </>
        );
    }

    return (
        <>
            <button
                className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 cursor-pointer"
                onClick={() => setMobileOpen(true)}
            >
                <Menu size={18} />
            </button>

            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                />
            )}

            <div
                className={`fixed lg:static inset-y-0 left-0 z-50 w-[270px] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06] transition-transform duration-300 ${
                    mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
                        <button
                            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] bg-transparent border-none cursor-pointer"
                            onClick={() => setCollapsed(true)}
                        >
                            <PanelLeftIcon size={18} />
                        </button>

                        <button
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] bg-transparent border-none cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1">
                            MultiAgentAI
                        </span>

                        <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {userData?.plan || "free"}
                        </span>

                        <button
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] bg-transparent border-none cursor-pointer"
                            onClick={handleCreateConversation}
                        >
                            <PenSquare size={15} />
                        </button>
                    </div>

                    <div className="px-4 pt-4 pb-1">
                        <button
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-[10px] border-none cursor-pointer hover:opacity-90"
                            onClick={handleCreateConversation}
                        >
                            <Plus size={15} />
                            New Chat
                        </button>
                    </div>

                    <div className="px-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setPdfOpen(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.08] py-[9px] text-sm font-medium text-amber-100 hover:bg-amber-300/[0.14]"
                        >
                            <FileText size={15} />
                            PDF Studio
                        </button>
                    </div>

                    <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
                        {conversations?.length > 0
                            ? "Recents"
                            : "No Recent Conversations"}
                    </div>

                    <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {conversations?.map((conv) => {
                            const isActive =
                                selectedConversation?._id === conv?._id;

                            return (
                                <div
                                    key={conv?._id}
                                    onClick={() =>
                                        dispatch(
                                            setSelectedConversation(conv)
                                        )
                                    }
                                    className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                                        isActive
                                            ? "bg-indigo-500/10 border-indigo-500/[0.18]"
                                            : "bg-transparent border-transparent hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <div
                                        className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg ${
                                            isActive
                                                ? "bg-indigo-500/15 text-indigo-400"
                                                : "bg-white/[0.05] text-slate-500"
                                        }`}
                                    >
                                        <MessageSquare size={13} />
                                    </div>

                                    <span
                                        className={`text-[13px] font-medium truncate ${
                                            isActive
                                                ? "text-slate-100"
                                                : "text-slate-300"
                                        }`}
                                    >
                                        {conv?.title || "New Chat"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mx-2.5 h-px bg-white/[0.06]" />

                    {userData && (
                        <div className="px-3.5 pt-3">
                            <button
                                type="button"
                                onClick={() => setPlanOpen(true)}
                                className="flex w-full items-center justify-between rounded-lg border border-indigo-400/20 bg-indigo-500/[0.08] px-3 py-2 text-left text-xs text-indigo-100 hover:bg-indigo-500/[0.14]"
                            >
                                <span className="flex items-center gap-2">
                                    <Crown size={14} className="text-indigo-300" />
                                    View plans
                                </span>
                                <span className="text-[10px] text-indigo-300">
                                    {currentPlan}
                                </span>
                            </button>
                        </div>
                    )}

                    <div className="px-3.5 py-3.5">
                        {userData ? (
                            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
                                <div className="relative shrink-0">
                                    {userData?.avatar && !imageError ? (
                                        <img
                                            className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                                            src={userData.avatar}
                                            alt="user"
                                            onError={() =>
                                                setImageError(true)
                                            }
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center">
                                            <User
                                                size={15}
                                                className="text-slate-400"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[13.5px] font-semibold text-slate-100 truncate">
                                        {userData?.name || "User"}
                                    </p>

                                    <p className="text-[11px] text-slate-600 mt-px">
                                        {userData?.plan || "Free Plan"}
                                    </p>
                                </div>

                                <button
                                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400"
                                    onClick={async () => {
                                        await logOut();
                                    }}
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-slate-500 py-3">
                                Please login
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {planOpen && (
                <PlanModal
                    onClose={() => setPlanOpen(false)}
                    onPlanUpdated={handlePlanUpdated}
                />
            )}
            {pdfOpen && <PdfWorkspace onClose={() => setPdfOpen(false)} />}
        </>
    );
}

export default SideBar;