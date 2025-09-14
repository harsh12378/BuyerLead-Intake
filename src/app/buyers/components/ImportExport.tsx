// components/ImportExport.tsx
'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import { CSV_HEADERS } from '../../../../lib/csvHelpers';
import { useAuth } from '@/app/providers/AuthProvider';
import { z } from 'zod'
import { useRouter } from 'next/navigation';

export default function ImportExport({ filters }: { filters?: Record<string,string> }) {
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
   const { user } = useAuth();
   const router=useRouter();
   // --- Zod Schema ---
const buyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must be at most 80 characters'),

  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .regex(/^\d{10,15}$/, 'Phone must be 10-15 digits only'),

  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),

  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),

  bhk: z.enum(['Studio', 'One', 'Two', 'Three', 'Four']).optional(),

  purpose: z.enum(['Buy', 'Rent']),

  budgetMin: z.number().positive('Budget min must be positive').optional(),
  budgetMax: z.number().positive('Budget max must be positive').optional(),

  timeline: z.enum(['ZeroTo3m', 'ThreeTo6m', 'MoreThan6m', 'Exploring']),

  source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']),

  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
  tags: z.array(z.string()).optional(),

  status: z.enum(['New','Qualified','Contacted','Visited','Negotiation','Converted','Dropped']),

  ownerId: z.string().min(1, 'Owner ID is required')
}).refine((data) => {
  // BHK required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false
  }
  return true
}, {
  message: "BHK is required for Apartment and Villa",
  path: ["bhk"]
}).refine((data) => {
  // Budget max should be >= budget min
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false
  }
  return true
}, {
  message: "Budget max must be greater than or equal to budget min",
  path: ["budgetMax"]
});


//File Handler
async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  const text = await file?.text();
  if (!text) return;

  Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    complete: (results: any) => {
      const parsed = results.data as Record<string, string>[];

      //Check headers
      const headers = results.meta.fields ?? [];
      const missing = CSV_HEADERS.filter(h => !headers.includes(h));
      if (missing.length) {
        setErrors([{ row: 0, messages: [`Missing headers: ${missing.join(', ')}`] }]);
        setPreviewRows([]);
        return;
      }

      //Check row count
      if (parsed.length > 200) {
        setErrors([{ row: 0, messages: ['CSV has more than 200 rows. Max 200 allowed.'] }]);
        setPreviewRows([]);
        return;
      }

      const rowErrors: any[] = [];
      const cleanedRows: any[] = [];

     parsed.forEach((row, idx) => {
  const errorsForRow: string[] = [];

  //Normalize empty strings to undefined
     Object.keys(row).forEach((key) => {
        if (row[key] !== undefined && row[key] !== null && row[key].toString().trim() === "") {
          (row as any)[key] = undefined;
        }
       });

  //Normalize bhk
  if (row.bhk) {
    if (row.bhk === "1") row.bhk = "One";
    else if (row.bhk === "2") row.bhk = "Two";
    else if (row.bhk === "3") row.bhk = "Three";
    else if (row.bhk === "4") row.bhk = "Four";
    else if (row.bhk === "0" || row.bhk.toLowerCase() === "studio") row.bhk = "Studio";
  }

  // Normalize timeline
  if (row.timeline) {
    if (row.timeline === "0-3m") row.timeline = "ZeroTo3m";
    else if (row.timeline === "3-6m") row.timeline = "ThreeTo6m";
    else if (row.timeline === ">6m") row.timeline = "MoreThan6m";
    else if (row.timeline.toLowerCase() === "exploring") row.timeline = "Exploring";
  }
  if(row.source==="Walk-in"){
    console.log(row.source);
    row.source="WalkIn"
    console.log(row.source);

  }

  //Prepare for validation
  const dataToValidate = {
    ...row,
  fullName: row.fullName?.trim() || undefined,
  email: row.email?.trim() || undefined,
  phone: row.phone?.trim() || undefined,
  city: row.city?.trim() || undefined,
  propertyType: row.propertyType?.trim() || undefined,
  bhk: row.bhk?.trim() || undefined,
  purpose: row.purpose?.trim() || undefined,
  budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
  budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
  timeline: row.timeline?.trim() || undefined,
  source: row.source?.trim() || undefined,
  notes: row.notes?.trim() || undefined,
  tags: row.tags ? row.tags.split(",").map(t => t.trim()) : [],
  status: row.status?.trim() || "New",
  ownerId: user?.id,
  };

  // Validate with Zod 
  const result = buyerSchema.safeParse(dataToValidate);
  if (!result.success) {
    result.error.issues.forEach(err => {
      errorsForRow.push(`${err.path.join(".")}: ${err.message}`);
    });
  }

  // Collect errors or add valid row
  if (errorsForRow.length > 0) {
    rowErrors.push({ row: idx + 1, messages: errorsForRow });
  } else {
    cleanedRows.push(result.data);
  }
});


      //Set state
      if (rowErrors.length > 0) {
        setErrors(rowErrors);
        setPreviewRows([]);
      } else {
        setErrors([]);
        console.log(cleanedRows);
        setPreviewRows(cleanedRows);
      }
    },
    error: (err: any) => {
      setErrors([{ row: 0, messages: [err.message] }]);
      setPreviewRows([]);
    }
  });
}




  async function handleImport() {
    console.log("import clicked");
    if (previewRows.length === 0) {
      setErrors([{ row: 0, messages: ['No rows to import'] }]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/buyers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId:user?.id, rows: previewRows })
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? [{ row: 0, messages: [json.error ?? 'Unknown error'] }]);
      } else {
        alert(`Inserted ${json.inserted} rows`);
        router.refresh();
        setPreviewRows([]);
        setErrors([]);
      }
    } catch (err: any) {
      setErrors([{ row: 0, messages: [err.message ?? 'Network error'] }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    // Build query string from filters if provided
    const qs = filters ? new URLSearchParams(filters).toString() : '';
    const url = `/api/buyers/export${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      const json = await res.json();
      alert('Export failed: ' + (json.error ?? res.statusText));
      return;
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    const urlObj = URL.createObjectURL(blob);
    a.href = urlObj;
    a.download = 'buyers_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(urlObj);
  }

 return (
  <div className="w-full space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Import CSV (max 200 rows)</label>
        <input
          type="file"
          accept=".csv"
          onChange={onFile}
          className="block w-full max-w-xs rounded border border-gray-300 bg-blue-50 px-3 py-2 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleImport}
          disabled={loading || previewRows.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
        
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
        >
          Export current list
        </button>
      </div>
    </div>

    {errors.length > 0 && (
      <div className="border p-3 bg-red-50 rounded">
        <h4 className="font-semibold text-red-700">Errors</h4>
        <ul className="list-disc pl-5 text-red-800">
          {errors.map((e, i) => (
            <li key={i}>Row {e.row}: {Array.isArray(e.messages) ? e.messages.join('; ') : e.messages}</li>
          ))}
        </ul>
      </div>
    )}

    {previewRows.length > 0 && (
      <div className="w-full">
        <h4 className="font-semibold mb-2">Preview ({previewRows.length} rows)</h4>
        <div className="overflow-x-auto max-h-64 border rounded bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 sticky top-0">
              <tr>
                {CSV_HEADERS.map(h => <th key={h} className="px-2 py-1 text-left whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0, 50).map((r, idx) => (
                <tr key={idx} className={idx % 2 ? 'bg-gray-50' : ''}>
                  {CSV_HEADERS.map((h) => <td key={h} className="px-2 py-1 whitespace-nowrap text-xs">{String(r[h] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {previewRows.length > 50 && <div className="text-xs text-gray-500 mt-1">Showing first 50 rows only</div>}
      </div>
    )}
  </div>
);
}
