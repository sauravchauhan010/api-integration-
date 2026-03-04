import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const Globe = () => {
  return (
    <mesh rotation={[0.4, 0.2, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#3b82f6"
        wireframe
        emissive="#2563eb"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
};

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [success, setSuccess] = useState(false);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">

      {/* 3D Globe Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} />
          <Globe />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl"
      >
        {!success ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-8 text-center">
              Create Account
            </h1>

            {/* Step Indicator */}
            <div className="flex justify-center mb-8 gap-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-3 w-3 rounded-full transition-all ${
                    step >= s ? "bg-blue-400" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <input
                      type="text"
                      placeholder="Company Name"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/20 text-white placeholder-white/60 outline-none border border-white/20 focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition"
                    >
                      Next
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <input
                      type="text"
                      placeholder="Agent Name"
                      required
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/20 text-white placeholder-white/60 outline-none border border-white/20 focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-1/2 py-4 rounded-2xl bg-white/20 text-white"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-1/2 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold"
                      >
                        Next
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/20 text-white placeholder-white/60 outline-none border border-white/20 focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/20 text-white placeholder-white/60 outline-none border border-white/20 focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-1/2 py-4 rounded-2xl bg-white/20 text-white"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                      >
                        Register
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center text-white text-center"
          >
            <CheckCircle2 size={60} className="text-emerald-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Account Created</h2>
            <p className="text-white/70">
              Welcome to the global travel network.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RegisterPage;
