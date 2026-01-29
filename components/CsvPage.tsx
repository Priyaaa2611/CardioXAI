import React, { useState } from 'react';
import {
    FileText,
    Upload,
    CheckCircle,
    Database,
    Loader2,
    Play,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientData, ECGData, TMTData } from '../types';

interface CsvPatient {
    id: string;
    patient: PatientData;
    ecg: ECGData;
    tmt: TMTData;
}

const CsvPage: React.FC = () => {
    const [data, setData] = useState<CsvPatient[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [processingPredictions, setProcessingPredictions] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setUploadSuccess(false);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            setData(result);
            setUploadSuccess(true);
        } catch (error) {
            console.error(error);
            alert('Error uploading dataset');
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (confirm('Are you sure you want to clear the uploaded records?')) {
            setData([]);
            setUploadSuccess(false);
        }
    };

    const handleRunBatchPrediction = async () => {
        setProcessingPredictions(true);
        // Simulate batch processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        alert('Batch prediction completed! (In a real scenario, this would send data to Gemini and save results)');
        setProcessingPredictions(false);
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto text-center px-4">
            <div className="space-y-4">
                <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-4">
                    <Database size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Batch <span className="text-indigo-500">Cardiac</span> Analysis
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Upload your patient dataset in CSV format for automated AI-powered diagnostic screening.
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card p-12 rounded-[2.5rem] flex flex-col items-center gap-6"
                        >
                            <div className="relative">
                                <Loader2 className="animate-spin text-indigo-500" size={64} />
                                <div className="absolute inset-0 blur-2xl bg-indigo-500/20 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Uploading Dataset...</h3>
                                <p className="text-sm text-slate-500">Processing records and validating data structure</p>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    className="bg-indigo-500 h-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                        </motion.div>
                    ) : uploadSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 rounded-[2.5rem] border-indigo-500/30"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Upload Successful!</h3>
                                    <p className="text-slate-400 font-medium">
                                        <span className="text-white bg-indigo-500/20 px-2 py-0.5 rounded-lg mr-1">{data.length}</span>
                                        records ready for analysis
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
                                    <button
                                        onClick={handleClearData}
                                        className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/5"
                                    >
                                        <Trash2 size={18} /> Clear
                                    </button>
                                    <button
                                        onClick={handleRunBatchPrediction}
                                        disabled={processingPredictions}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/40 disabled:opacity-50"
                                    >
                                        {processingPredictions ? (
                                            <><Loader2 className="animate-spin" size={18} /> Processing...</>
                                        ) : (
                                            <><Play size={18} /> Run Batch Analysis</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative group"
                        >
                            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all hover:border-indigo-500/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-5 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="text-slate-400 group-hover:text-indigo-400" size={32} />
                                    </div>
                                    <p className="mb-2 text-lg font-bold">
                                        Click to <span className="text-indigo-500">upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-slate-500">CSV, XLS or XLSX (Max. 10MB)</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv, .xlsx, .xls" />
                            </label>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-indigo-400 mb-2"><FileText size={20} /></div>
                                    <h4 className="text-sm font-bold mb-1">Standard Format</h4>
                                    <p className="text-[12px] text-slate-500">Ensure columns match the ECG & TMT parameters.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-indigo-400 mb-2"><CheckCircle size={20} /></div>
                                    <h4 className="text-sm font-bold mb-1">Auto-Validation</h4>
                                    <p className="text-[12px] text-slate-500">AI automatically filters anomalies and empty rows.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-indigo-400 mb-2"><AlertCircle size={20} /></div>
                                    <h4 className="text-sm font-bold mb-1">Safe Storage</h4>
                                    <p className="text-[12px] text-slate-500">Records are processed locally and securely.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pro Tip Section */}
            <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-6 py-4 max-w-xl">
                <FileText className="text-indigo-400 shrink-0" size={20} />
                <p className="text-sm font-medium text-indigo-300 text-left">
                    <span className="font-black uppercase mr-2 opacity-50">Experimental:</span>
                    For best accuracy, ensure your CSV includes ST Segment Depression and METs achieved columns.
                </p>
            </div>
        </div>
    );
};

export default CsvPage;

