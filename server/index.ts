
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
if (process.env.NODE_ENV !== 'production') {
    console.log('Loading env from:', envPath);
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // Load variables from environment
}

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase (Backend)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const datasheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(datasheet) as any[];

        if (data.length === 0) {
            return res.status(400).json({ error: 'Empty file' });
        }

        // Map all rows to the expected format
        const mappedData = data.map((row, index) => {
            // Helper to get value regardless of key casing or common variants
            const getValue = (variants: string[]) => {
                const keys = Object.keys(row);
                for (const variant of variants) {
                    const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === variant.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    if (match) return row[match];
                }
                return null;
            };

            const patientName = getValue(['Name', 'PatientName', 'FullName', 'Patient', 'PatientID']) || `Patient ${index + 1}`;
            const genderValue = String(getValue(['Gender', 'Sex']) || 'Male').toLowerCase();

            return {
                patient_id: getValue(['PatientID', 'ID', 'MRN']) || `P-${index + 1}`,
                name: String(patientName).trim(),
                age: parseInt(getValue(['Age'])) || 45,
                gender: genderValue.startsWith('f') ? 'Female' : 'Male',
                resting_hr: parseInt(getValue(['RestingHR', 'HeartRate', 'HR', 'RestHR'])) || 72,
                systolic_bp: parseInt(getValue(['SystolicBP', 'BPSys', 'BP_Systolic', 'Systolic'])) || 120,
                diastolic_bp: parseInt(getValue(['DiastolicBP', 'BPDia', 'BP_Diastolic', 'Diastolic'])) || 80,
                st_depression: parseFloat(getValue(['STDepression', 'ST_Depression', 'ST_Change', 'Depression'])) || 0,
                st_slope: getValue(['ST_Slope', 'Slope']) || 'Upsloping',
                qrs_duration: parseInt(getValue(['QRSDuration', 'QRS_Duration', 'QRS'])) || 90,
                pr_interval: parseInt(getValue(['PRInterval', 'PR_Interval', 'PR'])) || 160,
                mets_achieved: parseFloat(getValue(['METs', 'METsAchieved', 'ExerciseMETs'])) || 10,
                max_heart_rate: parseInt(getValue(['MaxHeartRate', 'MaxHR', 'ExerciseHR'])) || 160,
                exercise_duration: parseInt(getValue(['ExerciseDuration', 'Duration'])) || 9,
                angina: String(getValue(['Angina', 'ExerciseAngina', 'CAD_Presence'])).toLowerCase().startsWith('y') || getValue(['Angina']) === 1,
            };
        });

        // Insert into Supabase
        const { data: insertedData, error } = await supabase
            .from('patient_records')
            .insert(mappedData)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Convert Supabase rows back to Frontend format for the table
        const responseData = insertedData.map(row => ({
            id: row.patient_id,
            patient: {
                name: row.name,
                age: row.age,
                gender: row.gender,
                restingHR: row.resting_hr,
                systolicBP: row.systolic_bp,
                diastolicBP: row.diastolic_bp,
            },
            ecg: {
                stDepression: row.st_depression,
                stSlope: row.st_slope,
                tWaveInversion: false,
                qrsDuration: row.qrs_duration,
                prInterval: row.pr_interval,
            },
            tmt: {
                metsAchieved: row.mets_achieved,
                maxExerciseHR: row.max_heart_rate,
                exerciseDuration: row.exercise_duration,
                anginaDuringExercise: row.angina,
                targetHRAttained: true,
            }
        }));

        res.json(responseData);
    } catch (error) {
        console.error('Error parsing file:', error);
        res.status(500).json({ error: 'Failed to process and save file data' });
    }
});

app.get('/records', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('patient_records')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const responseData = data.map(row => ({
            id: row.patient_id,
            patient: {
                name: row.name,
                age: row.age,
                gender: row.gender,
                restingHR: row.resting_hr,
                systolicBP: row.systolic_bp,
                diastolicBP: row.diastolic_bp,
            },
            ecg: {
                stDepression: row.st_depression,
                stSlope: row.st_slope,
                tWaveInversion: false,
                qrsDuration: row.qrs_duration,
                prInterval: row.pr_interval,
            },
            tmt: {
                metsAchieved: row.mets_achieved,
                maxExerciseHR: row.max_heart_rate,
                exerciseDuration: row.exercise_duration,
                anginaDuringExercise: row.angina,
                targetHRAttained: true,
            }
        }));

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

app.delete('/records', async (req, res) => {
    try {
        const { error } = await supabase
            .from('patient_records')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

        if (error) throw error;

        res.json({ message: 'Dataset cleared successfully' });
    } catch (error) {
        console.error('Error clearing records:', error);
        res.status(500).json({ error: 'Failed to clear records' });
    }
});

// Serve static files from the 'dist' directory
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA routing - serve index.html for any unknown routes
app.get('*path', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
