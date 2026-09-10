import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { auth, googleProvider } from "../../utils/firebase.js";
import api from "../../utils/axios.js";
import { setUserdata } from "../redux/userSlice.js";

import SideBar from "../components/SideBar.jsx";
import ChatArea from "../components/ChatArea.jsx";
import Artifact from "../components/Artifact.jsx";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (token) => {
    const { data } = await api.post("/api/auth/login", {
      token,
    });

    dispatch(setUserdata(data));

    return data;
  };

  const googleLogin = async () => {
    if (loginLoading) return;

    try {
      setLoginLoading(true);
      setError("");

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const token = await result.user.getIdToken();

      await handleLogin(token);
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setError("Login was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError(
          "The login popup was blocked. Please allow popups and try again."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">
      {/* Main App */}
      <SideBar />
      <ChatArea />
      <Artifact />

      {/* Login Overlay */}
      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090d]/80 backdrop-blur-md p-4">
          {/* Background glow */}
          <div className="absolute w-[420px] h-[420px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

          {/* Modal */}
          <div className="relative w-full max-w-[380px] bg-[#12141b]/95 border border-white/[0.08] rounded-3xl p-7 md:p-8 shadow-2xl">
            {/* Logo */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
              <Sparkles size={21} className="text-white" />
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-[22px] font-semibold text-white tracking-tight">
                Welcome to MultiAgentAI
              </h2>

              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">
                Sign in to save your conversations and continue your AI
                experience.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Google Login */}
            <button
              type="button"
              onClick={googleLogin}
              disabled={loginLoading}
              className="group relative w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <FcGoogle size={20} />
              )}

              <span>
                {loginLoading
                  ? "Signing in..."
                  : "Continue with Google"}
              </span>
            </button>

            {/* Footer */}
            <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-600">
              By continuing, you agree to continue securely with Google.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;