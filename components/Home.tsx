
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

                        <div id="report-content" className="space-y-8 bg-slate-950 p-4 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -z-10" />

                            {/* Analysis Summary Header */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="glass-card p-6 rounded-3xl flex flex-col justify-center border-l-4 border-l-red-500">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Risk Score</span>
                                    <span className="text-3xl font-black text-white">{report.riskScore}%</span>
                                </div>
                                <div className="glass-card p-6 rounded-3xl flex flex-col justify-center border-l-4 border-l-indigo-500">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Patient</span>
                                    <span className="text-lg font-bold text-white truncate">{report.name}</span>
                                </div>
                                <div className="glass-card p-6 rounded-3xl flex flex-col justify-center border-l-4 border-l-emerald-500">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Status</span>
                                    <span className={`text-sm font-black uppercase ${report.riskScore > 70 ? 'text-red-400' : report.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {report.riskScore > 70 ? 'CRITICAL' : report.riskScore > 40 ? 'MODERATE' : 'STABLE'}
                                    </span>
                                </div>
                                <div className="glass-card p-6 rounded-3xl flex flex-col justify-center border-l-4 border-l-slate-500">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Generated</span>
                                    <span className="text-sm font-bold text-slate-400">{report.date.split(',')[0]}</span>
                                </div>
                            </div>

                            {/* Visual Analysis Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8 relative z-10">Neural Risk Visualization</h3>
                                    <div className="relative z-10 scale-110">
                                        <Heart3D intensity={report.riskScore / 100} />
                                    </div>
                                    <div className="mt-8 relative z-10">
                                        <span className={`px-6 py-2 rounded-full text-xs font-black tracking-tighter ${report.riskScore > 70 ? 'bg-red-500/20 text-red-500' :
                                            report.riskScore > 40 ? 'bg-amber-500/20 text-amber-500' :
                                                'bg-emerald-500/20 text-emerald-500'
                                            }`}>
                                            {report.riskScore > 70 ? 'HIGH PRIORITY CASE' : report.riskScore > 40 ? 'FOLLOW-UP RECOMMENDED' : 'ROUTINE MONITORING'}
                                        </span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 glass-card p-8 rounded-3xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Explainable AI: Multi-Modal Feature Impact</h3>
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={report.featureImportance} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="feature" type="category" stroke="#64748b" width={100} fontSize={10} fontWeight="bold" />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                                                />
                                                <Bar dataKey="impact" radius={[0, 8, 8, 0]} barSize={20}>
                                                    {report.featureImportance.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.impact > 7 ? '#ef4444' : '#10b981'} fillOpacity={0.8} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="glass-card p-8 rounded-3xl relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-red-500/10">
                                            <Stethoscope className="text-red-500" size={20} />
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight">Clinical Interpretation</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed text-sm bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                        "{report.explanation}"
                                    </p>
                                    <div className="mt-8">
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-[0.2em]">Differential Diagnosis</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {report.potentialConditions.map((c, i) => (
                                                <span key={i} className="bg-slate-900 border border-white/10 text-slate-300 px-4 py-1.5 rounded-xl text-[11px] font-bold hover:border-red-500/50 transition-colors">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                            <Leaf className="text-emerald-500" size={20} />
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight">Therapeutic Guidance</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Clinical Nutrition</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {report.recommendations.diet.map((item, i) => (
                                                    <div key={i} className="text-[11px] font-bold text-slate-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-lg">
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]">Botanical Support</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {report.recommendations.herbs.map((item, i) => (
                                                    <div key={i} className="text-[11px] font-bold text-slate-400 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-lg">
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations Section */}
                            <div className="glass-card p-8 rounded-3xl border-l-[6px] border-emerald-500 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500">
                                    <ShieldAlert size={120} />
                                </div>
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                                    <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle className="text-emerald-500" size={20} /></div>
                                    Lifestyle Prescription
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                    {report.recommendations.lifestyle.map((item, i) => (
                                        <div key={i} className="bg-slate-900/50 p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-sm font-medium text-slate-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="text-center bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] leading-relaxed">
                                    Artificial Intelligence Research Publication • Experimental Diagnostic Framework • Non-Binding Clinical Assessment
                                </p>
                                <p className="text-slate-700 text-[8px] font-medium mt-2">
                                    Model ID: CardioXAI-V2.4 • Analysis Engine: Google Gemini Pro (Medical Subset)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Professional Report Template for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    id="professional-report-content"
                    className="bg-white text-slate-900 w-[210mm] min-h-[297mm] font-serif p-0"
                    style={{ background: 'white' }}
                >
                    {/* Top Aesthetic Border */}
                    <div className="h-4 bg-red-600 w-full" />

                    <div className="p-16">
                        {/* Medical Letterhead */}
                        <div className="flex justify-between items-start mb-16 border-b-2 border-slate-100 pb-12">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-2xl">C</div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">CARDIO<span className="text-red-600">XAI</span></h1>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Advanced Cardiovascular AI Research Lab</p>
                                <p className="text-[9px] text-slate-400 font-medium">Precision Medicine • Explainable AI • Molecular Cardiology Insights</p>
                            </div>
                            <div className="text-right space-y-2">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">DIAGNOSTIC REPORT</h2>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500">REF ID: <span className="font-mono text-slate-900">{report?.id}</span></p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">DATE: <span className="text-slate-900">{report?.date}</span></p>
                                    <div className="inline-block mt-4 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase border border-red-100">
                                        Digital Verified Security Report
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient & Summary Section */}
                        <div className="grid grid-cols-3 gap-12 mb-16">
                            <div className="col-span-2">
                                <h3 className="text-[10px] font-black uppercase text-red-600 mb-6 tracking-[0.2em] border-b border-red-100 pb-2">Patient Profile</h3>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="space-y-1 border-l-2 border-slate-100 pl-4">
                                        <p className="text-[9px] uppercase font-bold text-slate-400">Full Name</p>
                                        <p className="text-sm font-black text-slate-800">{report?.patient.name}</p>
                                    </div>
                                    <div className="space-y-1 border-l-2 border-slate-100 pl-4">
                                        <p className="text-[9px] uppercase font-bold text-slate-400">Age & Gender</p>
                                        <p className="text-sm font-black text-slate-800">{report?.patient.age}Y • {report?.patient.gender}</p>
                                    </div>
                                    <div className="space-y-1 border-l-2 border-slate-100 pl-4">
                                        <p className="text-[9px] uppercase font-bold text-slate-400">Resting Metrics</p>
                                        <p className="text-sm font-black text-slate-800">{report?.patient.restingHR} BPM • {report?.patient.systolicBP}/{report?.patient.diastolicBP} mmHg</p>
                                    </div>
                                    <div className="space-y-1 border-l-2 border-slate-100 pl-4">
                                        <p className="text-[9px] uppercase font-bold text-slate-400">Risk Severity</p>
                                        <p className={`text-sm font-black ${report?.riskScore > 70 ? 'text-red-600' : report?.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {report?.riskScore}% - {report?.riskScore > 70 ? 'CRITICAL RISK' : report?.riskScore > 40 ? 'MODERATE RISK' : 'LOW RISK'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center leading-tight">AI Confidence Score</div>
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * (report?.riskScore || 0)) / 100}
                                            className={report?.riskScore > 70 ? 'text-red-500' : 'text-emerald-500'}
                                        />
                                    </svg>
                                    <span className="absolute text-xl font-black text-slate-800">{report?.riskScore}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Parameters Analysis */}
                        <div className="mb-16">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em] border-b border-slate-100 pb-2">Quantitative Clinical Parameters</h3>
                            <div className="grid grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black text-slate-800 italic underline decoration-red-200 underline-offset-4">Electrocardiography (ECG)</h4>
                                    <table className="w-full text-[10px]">
                                        <tbody className="space-y-3">
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">ST-Segment Depression</td><td className="py-2 text-right font-black">{report?.ecg.stDepression} mm</td></tr>
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">Repolarization Slope</td><td className="py-2 text-right font-black">{report?.ecg.stSlope}</td></tr>
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">QRS Complex Duration</td><td className="py-2 text-right font-black">{report?.ecg.qrsDuration} ms</td></tr>
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">PR Interval Analysis</td><td className="py-2 text-right font-black">{report?.ecg.prInterval} ms</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black text-slate-800 italic underline decoration-indigo-200 underline-offset-4">Physical Stress Dynamics (TMT)</h4>
                                    <table className="w-full text-[10px]">
                                        <tbody className="space-y-3">
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">Metabolic Equivalents (METs)</td><td className="py-2 text-right font-black">{report?.tmt.metsAchieved} METs</td></tr>
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">Max Chronotropic Response</td><td className="py-2 text-right font-black">{report?.tmt.maxExerciseHR} BPM</td></tr>
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">Exercise Tolerance Secs</td><td className="py-2 text-right font-black">{report?.tmt.exerciseDuration} min</td></tr>
                                            <tr className="border-b border-slate-50"><td className="py-2 text-slate-500">Cardiovascular Angina</td><td className="py-2 text-right font-black">{report?.tmt.anginaDuringExercise ? 'Observed' : 'Absent'}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Professional Findings */}
                        <div className="mb-16 bg-slate-900 text-white p-12 rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-3xl rounded-full" />
                            <h3 className="text-[10px] font-black uppercase text-red-500 mb-6 tracking-[0.2em]">Artificial Intelligence Synthesis</h3>
                            <div className="space-y-6">
                                <p className="text-base font-serif leading-relaxed text-slate-100 italic">
                                    "{report?.explanation}"
                                </p>
                                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-3">
                                    {report?.potentialConditions.map((c, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black uppercase tracking-wider text-slate-300">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Prescription Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-20">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100 pb-2">Clinical Recommendations</h4>
                                <ul className="space-y-4">
                                    {report?.recommendations.lifestyle.map((item, i) => (
                                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                                            <span className="font-medium leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100 pb-2">Therapeutic Support</h4>
                                <div className="space-y-8">
                                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase mb-3 underline underline-offset-2">Dietary Strategy</p>
                                        <p className="text-[10px] text-slate-700 font-bold leading-relaxed italic">{report?.recommendations.diet.join(', ')}</p>
                                    </div>
                                    <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                        <p className="text-[9px] font-black text-amber-600 uppercase mb-3 underline underline-offset-2">Botanical/Pharma Support</p>
                                        <p className="text-[10px] text-slate-700 font-bold leading-relaxed italic">{report?.recommendations.herbs.join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signature Area */}
                        <div className="mt-auto pt-16 border-t-2 border-slate-100 flex justify-between items-end">
                            <div className="space-y-4 max-w-[60%]">
                                <div className="text-[9px] font-black text-slate-800 uppercase flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-600" />
                                    Digital Verification Stamp Card
                                </div>
                                <p className="text-[8px] text-slate-400 leading-tight uppercase font-bold pr-12">
                                    This document is generated for research and educational assistance. Clinical decisions should be ratified by a human cardiologist after physical examination.
                                    The model utilized (CardioXAI-V2) has been trained on valid medical archives.
                                </p>
                            </div>
                            <div className="text-center w-64">
                                <div className="h-16 flex items-center justify-center mb-2 px-4 italic font-serif text-slate-400 text-sm opacity-50 select-none">
                                    Digitally Signed by CardioXAI Neural Engine
                                </div>
                                <div className="border-t border-slate-300 pt-3">
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">AI Lab Director Signature</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Research Publication Series</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

