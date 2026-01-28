
import React, { useState } from 'react';
import {
    FileText,
    Upload,
    Table as TableIcon,
    ArrowRight,
    Database,
    Search,
    Trash2
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

    // Fetch data on mount
    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3001/records');
                if (!response.ok) throw new Error('Failed to fetch records');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
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
        } catch (error) {
            console.error(error);
            alert('Error uploading dataset');
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (confirm('Are you sure you want to clear the entire dataset from Supabase?')) {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3001/records', {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to clear records');
                setData([]);
            } catch (error) {
                console.error(error);
                alert('Error clearing dataset');
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredData = data.filter(p =>
        p.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                        <Database className="text-indigo-500" size={32} />
                        Dataset Analysis
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm md:text-base">Upload and manage cardiac datasets for batch prediction.</p>
                </div>

                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                    {/* Mobile Desktop Recommendation Message */}
                    <div className="lg:hidden bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-2 sm:mb-0">
                        <FileText className="text-indigo-400 shrink-0" size={18} />
                        <p className="text-xs font-bold text-indigo-300">
                            Pro Tip: For larger datasets, please add via Desktop for the best experience.
                        </p>
                    </div>

                    {data.length > 0 && (
                        <button
                            onClick={handleClearData}
                            disabled={window.innerWidth < 1024}
                            className="w-full sm:w-auto bg-white/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={18} />
                            Clear Dataset
                        </button>
                    )}
                    <label className={`w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 ${window.innerWidth < 1024 ? 'opacity-30 cursor-not-allowed grayscale pointer-events-none' : 'cursor-pointer'}`}>
                        <Upload size={18} />
                        Upload Dataset
                        <input type="file" className="hidden" disabled={window.innerWidth < 1024} onChange={handleFileUpload} accept=".csv, .xlsx, .xls" />
                    </label>
                </div>
            </div>

            <div className="glass-card rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        <span>Total Records: {filteredData.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <th className="px-6 py-4">Patient ID</th>
                                <th className="px-6 py-4">Age/Gender</th>
                                <th className="px-6 py-4">BP (Sys/Dia)</th>
                                <th className="px-6 py-4">Heart Rate</th>
                                <th className="px-6 py-4">ST Change</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4 font-mono text-indigo-400">{row.id}</td>
                                    <td className="px-6 py-4">
                                        <div className={`font-bold ${row.patient.name.includes('Patient ') ? 'text-slate-500 italic font-normal' : ''}`}>
                                            {row.patient.name.includes('Patient ') ? 'Enter Name...' : row.patient.name}
                                        </div>
                                        <div className="text-xs text-slate-500">{row.patient.age}y {row.patient.gender}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">{row.patient.systolicBP}/{row.patient.diastolicBP}</td>
                                    <td className="px-6 py-4 font-mono text-sm">{row.patient.restingHR} bpm</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${row.ecg.stDepression > 1 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                            {row.ecg.stDepression} mm
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="bg-white/5 hover:bg-indigo-500 hover:text-white p-2 rounded-lg transition-all group-hover:scale-105">
                                            <ArrowRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Database size={48} />
                                            <p className="font-bold uppercase tracking-widest">No data available</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
                        <div className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-white">{filteredData.length}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CsvPage;
