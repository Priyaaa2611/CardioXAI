
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Heart,
    ChevronRight,
    ChevronLeft,
    Download,
    ShieldAlert,
    CheckCircle,
    Stethoscope,
    Leaf
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Heart3D from './Heart3D';
import ECGWave from './ECGWave';
import { analyzeCardiacData } from '../services/geminiService';
import { generatePDFReport } from '../services/pdfService';
import { PatientData, ECGData, TMTData, FullReport } from '../types';

const steps = ['Patient Info', 'ECG Data', 'TMT Parameters', 'Analysis'];

const Home: React.FC = () => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<FullReport | null>(null);

    // Form States
    const [patient, setPatient] = useState<PatientData>({
        name: '',
        age: 0,
        gender: '' as any,
        restingHR: 0,
        systolicBP: 0,
        diastolicBP: 0,
    });

    const [ecg, setEcg] = useState<ECGData>({
        stDepression: 0,
        stSlope: '' as any,
        tWaveInversion: false,
        qrsDuration: 0,
        prInterval: 0,
    });

    const [tmt, setTmt] = useState<TMTData>({
        metsAchieved: 0,
        maxExerciseHR: 0,
        exerciseDuration: 0,
        anginaDuringExercise: false,
        targetHRAttained: false,
    });

    const handleRunAnalysis = async () => {
        setLoading(true);
        try {
            const result = await analyzeCardiacData(patient, ecg, tmt);
            const fullReport: FullReport = {
                ...result,
                id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                date: new Date().toLocaleString(),
                patient,
                ecg,
                tmt,
            };
            setReport(fullReport);
            setStep(3);
        } catch (error) {
            alert("Error analyzing data. Please check your API key and connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!report) return;
        await generatePDFReport('professional-report-content', `CardioXAI_Report_${report.name}_${report.id}.pdf`);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 mt-4 md:mt-8">
            {/* Step Indicator */}
            <div className="flex justify-between mb-8 md:mb-12 relative overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2 min-w-[400px]" />
                {steps.map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 min-w-[80px]">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${idx <= step ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-900 border-white/20 text-white/40'
                            }`}>
                            {idx < step ? <CheckCircle size={16} /> : <span className="text-xs md:text-sm">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${idx <= step ? 'text-red-400' : 'text-white/20'}`}>
                            {s}
                        </span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    >
                        <div className="space-y-6">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                                Intelligent <span className="text-red-500">Cardiac</span> Risk Assessment
                            </h1>
                            <p className="text-slate-400 text-base md:text-lg">
                                Enter patient demographics to begin the multi-modal analysis using Integrated ECG and TMT data.
                            </p>

                            <div className="glass-card p-6 rounded-3xl space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter patient's full name"
                                        value={patient.name}
                                        onChange={e => setPatient({ ...patient, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Age</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 45"
                                            value={patient.age || ''}
                                            onChange={e => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gender</label>
                                        <select
                                            value={patient.gender}
                                            onChange={e => setPatient({ ...patient, gender: e.target.value as any })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rest HR</label>
                                        <input
                                            type="number"
                                            placeholder="72"
                                            value={patient.restingHR || ''}
                                            onChange={e => setPatient({ ...patient, restingHR: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">BP Sys</label>
                                        <input
                                            type="number"
                                            placeholder="120"
                                            value={patient.systolicBP || ''}
                                            onChange={e => setPatient({ ...patient, systolicBP: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">BP Dia</label>
                                        <input
                                            type="number"
                                            placeholder="80"
                                            value={patient.diastolicBP || ''}
                                            onChange={e => setPatient({ ...patient, diastolicBP: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!patient.name.trim()) {
                                        alert("Please enter patient name to continue.");
                                        return;
                                    }
                                    if (!patient.gender) {
                                        alert("Please select patient gender to continue.");
                                        return;
                                    }
                                    setStep(1);
                                }}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all group"
                            >
                                Proceed to ECG Data <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="hidden md:flex justify-center relative">
                            <Heart3D intensity={0.4} />
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="glass-card rounded-3xl p-8 mb-6 ecg-grid">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="text-red-500" />
                                <h2 className="text-2xl font-bold">ECG Parameters Analysis</h2>
                            </div>

                            <ECGWave className="mb-8" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ST Segment Depression (mm)</label>
                                    <input
                                        type="number" step="0.1"
                                        placeholder="0.5"
                                        value={ecg.stDepression || ''}
                                        onChange={e => setEcg({ ...ecg, stDepression: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ST Slope Type</label>
                                    <select
                                        value={ecg.stSlope}
                                        onChange={e => setEcg({ ...ecg, stSlope: e.target.value as any })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    >
                                        <option value="" disabled>Select ST Slope</option>
                                        <option value="Upsloping">Upsloping</option>
                                        <option value="Flat">Flat</option>
                                        <option value="Downsloping">Downsloping</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">QRS Duration (ms)</label>
                                    <input
                                        type="number"
                                        placeholder="90"
                                        value={ecg.qrsDuration || ''}
                                        onChange={e => setEcg({ ...ecg, qrsDuration: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PR Interval (ms)</label>
                                    <input
                                        type="number"
                                        placeholder="160"
                                        value={ecg.prInterval || ''}
                                        onChange={e => setEcg({ ...ecg, prInterval: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                <input
                                    type="checkbox"
                                    checked={ecg.tWaveInversion}
                                    onChange={e => setEcg({ ...ecg, tWaveInversion: e.target.checked })}
                                    className="w-5 h-5 accent-red-500"
                                />
                                <label className="text-sm font-medium">Signs of T-Wave Inversion Observed</label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(0)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                <ChevronLeft /> Back
                            </button>
                            <button onClick={() => {
                                if (!ecg.stSlope) {
                                    alert("Please select ST Slope type to continue.");
                                    return;
                                }
                                setStep(2);
                            }} className="flex-[2] bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                Next Step: TMT Parameters <ChevronRight />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="glass-card rounded-3xl p-8 mb-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="text-red-500" />
                                <h2 className="text-2xl font-bold">Treadmill Test (TMT) Analysis</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">METs Achieved</label>
                                    <input
                                        type="number" step="0.1"
                                        placeholder="10.0"
                                        value={tmt.metsAchieved || ''}
                                        onChange={e => setTmt({ ...tmt, metsAchieved: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Exercise HR (bpm)</label>
                                    <input
                                        type="number"
                                        placeholder="160"
                                        value={tmt.maxExerciseHR || ''}
                                        onChange={e => setTmt({ ...tmt, maxExerciseHR: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exercise Duration (min)</label>
                                    <input
                                        type="number"
                                        placeholder="9"
                                        value={tmt.exerciseDuration || ''}
                                        onChange={e => setTmt({ ...tmt, exerciseDuration: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={tmt.anginaDuringExercise}
                                        onChange={e => setTmt({ ...tmt, anginaDuringExercise: e.target.checked })}
                                        className="w-5 h-5 accent-red-500"
                                    />
                                    <label className="text-sm font-medium">Angina Experienced During Exercise</label>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={tmt.targetHRAttained}
                                        onChange={e => setTmt({ ...tmt, targetHRAttained: e.target.checked })}
                                        className="w-5 h-5 accent-red-500"
                                    />
                                    <label className="text-sm font-medium">Target Heart Rate Attained</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                <ChevronLeft /> Back
                            </button>
                            <button
                                disabled={loading}
                                onClick={handleRunAnalysis}
                                className="flex-[2] bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>Processing AI Analysis...</>
                                ) : (
                                    <>Run AI Diagnosis <Activity size={20} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && report && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8 pb-10"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-white/10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black">AI Diagnosis Result</h2>
                                <p className="text-slate-500 text-sm">Report ID: {report.id} • Generated on {report.date}</p>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                <Download size={18} /> <span className="text-sm">Download Medical PDF</span>
                            </button>
                        </div>

                        <div id="report-content" className="space-y-8 bg-slate-950 p-4 md:p-8 rounded-[2rem]">
                            {/* Visual Analysis Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Risk Severity</h3>
                                    <Heart3D intensity={report.riskScore / 100} />
                                    <div className="mt-4">
                                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${report.riskScore > 70 ? 'bg-red-500/20 text-red-500' :
                                            report.riskScore > 40 ? 'bg-amber-500/20 text-amber-500' :
                                                'bg-emerald-500/20 text-emerald-500'
                                            }`}>
                                            {report.riskScore > 70 ? 'CRITICAL RISK' : report.riskScore > 40 ? 'MODERATE RISK' : 'LOW RISK'}
                                        </span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 glass-card p-8 rounded-3xl">
                                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">Explainable AI: Feature Impact Analysis</h3>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={report.featureImportance} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="feature" type="category" stroke="#94a3b8" width={120} fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#ef4444' }}
                                                />
                                                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                                                    {report.featureImportance.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.impact > 7 ? '#ef4444' : '#10b981'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="glass-card p-8 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Stethoscope className="text-red-500" />
                                        <h3 className="text-xl font-bold">Clinical Interpretation</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {report.explanation}
                                    </p>
                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Potential Conditions Detected</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {report.potentialConditions.map((c, i) => (
                                                <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-bold">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Leaf className="text-emerald-500" />
                                        <h3 className="text-xl font-bold">Natural Home Remedies</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-emerald-500 mb-2">Dietary Modifications</h4>
                                            <ul className="grid grid-cols-1 gap-1">
                                                {report.recommendations.diet.map((item, i) => (
                                                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-1">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-amber-500 mb-2">Herbal Supports</h4>
                                            <ul className="grid grid-cols-1 gap-1">
                                                {report.recommendations.herbs.map((item, i) => (
                                                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                                        <span className="text-amber-500 mt-1">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations Section */}
                            <div className="glass-card p-8 rounded-3xl border-l-4 border-emerald-500">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <ShieldAlert className="text-emerald-500" /> Lifestyle Recommendations
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {report.recommendations.lifestyle.map((item, i) => (
                                        <div key={i} className="bg-emerald-500/5 p-4 rounded-xl flex items-center gap-3 border border-emerald-500/10">
                                            <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                                            <span className="text-sm text-slate-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="text-center text-slate-600 text-[10px] uppercase tracking-tighter mt-12">
                                This report is generated by an Artificial Intelligence system and is for educational/reference purposes only.
                                Please consult a certified Cardiologist for medical decisions.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Professional Report Template for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    id="professional-report-content"
                    className="bg-white text-slate-900 p-12 w-[210mm] min-h-[297mm] font-sans"
                    style={{ background: 'white', color: '#0f172a' }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-4 border-red-600 pb-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-1">CARDIO<span className="text-red-600">XAI</span></h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Advanced Cardiovascular AI Diagnostics</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-slate-800">DIAGNOSTIC REPORT</h2>
                            <p className="text-xs text-slate-500 mt-1">Report ID: <span className="font-mono">{report?.id}</span></p>
                            <p className="text-xs text-slate-500">Date: {report?.date}</p>
                        </div>
                    </div>

                    {/* Patient Information Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold bg-slate-100 px-4 py-2 border-l-4 border-slate-900 mb-4 uppercase">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-y-4 px-4 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-1 mr-8">
                                <span className="font-bold text-slate-500">Full Name:</span>
                                <span className="text-slate-900">{report?.patient.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="font-bold text-slate-500">Age:</span>
                                <span className="text-slate-900">{report?.patient.age} Years</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1 mr-8">
                                <span className="font-bold text-slate-500">Gender:</span>
                                <span className="text-slate-900">{report?.patient.gender}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="font-bold text-slate-500">Resting HR:</span>
                                <span className="text-slate-900">{report?.patient.restingHR} BPM</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1 mr-8">
                                <span className="font-bold text-slate-500">Blood Pressure:</span>
                                <span className="text-slate-900">{report?.patient.systolicBP}/{report?.patient.diastolicBP} mmHg</span>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Observation Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold bg-slate-100 px-4 py-2 border-l-4 border-slate-900 mb-4 uppercase">Clinical Findings</h3>
                        <div className="grid grid-cols-2 gap-8 px-4 text-sm">
                            <div className="space-y-3">
                                <h4 className="font-black text-xs text-red-600 uppercase border-b border-red-100 pb-1">ECG Parameters</h4>
                                <div className="flex justify-between"><span>ST Depression:</span> <span className="font-bold">{report?.ecg.stDepression} mm</span></div>
                                <div className="flex justify-between"><span>ST Slope:</span> <span className="font-bold">{report?.ecg.stSlope}</span></div>
                                <div className="flex justify-between"><span>QRS Duration:</span> <span className="font-bold">{report?.ecg.qrsDuration} ms</span></div>
                                <div className="flex justify-between"><span>PR Interval:</span> <span className="font-bold">{report?.ecg.prInterval} ms</span></div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-black text-xs text-red-600 uppercase border-b border-red-100 pb-1">Stress Test (TMT)</h4>
                                <div className="flex justify-between"><span>METs Achieved:</span> <span className="font-bold">{report?.tmt.metsAchieved}</span></div>
                                <div className="flex justify-between"><span>Max Exercise HR:</span> <span className="font-bold">{report?.tmt.maxExerciseHR} BPM</span></div>
                                <div className="flex justify-between"><span>Duration:</span> <span className="font-bold">{report?.tmt.exerciseDuration} min</span></div>
                                <div className="flex justify-between"><span>Angina:</span> <span className="font-bold">{report?.tmt.anginaDuringExercise ? 'Observed' : 'Not Observed'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* AI Diagnosis Result */}
                    <div className={`mb-8 p-6 rounded-2xl border-2 ${report?.riskScore > 70 ? 'bg-red-50 border-red-200' : report?.riskScore > 40 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black uppercase">AI Risk Severity</h3>
                            <span className={`px-4 py-1 rounded-full text-xs font-black text-white ${report?.riskScore > 70 ? 'bg-red-600' : report?.riskScore > 40 ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                                {report?.riskScore > 70 ? 'CRITICAL RISK' : report?.riskScore > 40 ? 'MODERATE RISK' : 'LOW RISK'}
                            </span>
                        </div>
                        <p className="text-slate-700 font-bold mb-4">{report?.explanation}</p>
                        <div className="flex flex-wrap gap-2">
                            {report?.potentialConditions.map((c, i) => (
                                <span key={i} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-800">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations Section */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div>
                            <h4 className="font-black text-xs uppercase text-slate-400 mb-3 tracking-tighter">Clinical Recommendations</h4>
                            <ul className="space-y-2">
                                {report?.recommendations.lifestyle.map((item, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                        <span className="text-red-500">•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-xs uppercase text-slate-400 mb-3 tracking-tighter">Natural Supports</h4>
                            <div className="space-y-3 text-xs">
                                <div>
                                    <p className="font-bold text-slate-700">Diet:</p>
                                    <p className="text-slate-500 leading-tight">{report?.recommendations.diet.join(', ')}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">Herbs/Supplements:</p>
                                    <p className="text-slate-500 leading-tight">{report?.recommendations.herbs.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signature Area */}
                    <div className="mt-auto border-t border-slate-100 pt-12 flex justify-between items-end">
                        <div className="text-[10px] text-slate-400 max-w-[60%] leading-tight uppercase font-bold">
                            Legal Disclaimer: This report is generated by an Artificial Intelligence system for screening assistance. Final medical decisions must be verified by a board-certified physician.
                        </div>
                        <div className="text-center w-48 border-t-2 border-slate-300 pt-2">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-800">Authorizing Signature</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tighter uppercase">Board Certified Cardiologist</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
