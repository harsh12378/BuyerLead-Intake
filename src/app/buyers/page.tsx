"use client"
import '../globals.css';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from './components/SearchBar';
import { ProtectedRoute, useAuth } from '../providers/AuthProvider';
import Header from './components/Header';
import { Metadata } from "next";

type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
  ownerId: string;
};

// Backend enum -> UI display
const timelinePrismaToUi: Record<string,string> = {
  ZeroTo3m: "0-3 months",
  ThreeTo6m: "3-6 months",
  MoreThan6m: ">6 months",
  Exploring: "Exploring"
};

const bhkPrismaToUi: Record<string,string> = {
  Studio: "Studio",
  One: "1 BHK",
  Two: "2 BHK",
  Three: "3 BHK",
  Four: "4 BHK"
};

// Separate component for the main content that uses useSearchParams
function BuyersContent() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const {user} = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get("page") || "1");
  const city = searchParams.get("city") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const status = searchParams.get("status") || "";
  const timeline = searchParams.get("timeline") || "";
  const search = searchParams.get("search") || "";

  // Fetch buyers from API
  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      if (page) params.set("page", page.toString());
      if (city) params.set("city", city);
      if (propertyType) params.set("propertyType", propertyType);
      if (status) params.set("status", status);
      if (timeline) params.set("timeline", timeline);
      if (search) params.set("search", search);

      const res = await fetch(`/api/buyers?${params.toString()}`);
      const data = await res.json();
      const mappedBuyers = data.buyers.map((row: any) => ({
       ...row,
       bhk: bhkPrismaToUi[row.bhk] ?? row.bhk,
       timeline: timelinePrismaToUi[row.timeline] ?? row.timeline,
       // optionally map tags to string if you want
       tags: Array.isArray(row.tags) ? row.tags.join(", ") : ""
       }));
      setBuyers(mappedBuyers);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
    };

    fetchBuyers();
  }, [page, city, propertyType, status, timeline, search]);

  // Handle page change
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`/buyers?${params.toString()}`);
  };

  if (loading) return <div className="p-4">Loading buyers...</div>;

  return (
    <>
      <SearchBar />
      <div className="p-4 min-h-screen bg-blue-50">
        <div className="mb-6 p-4 rounded-lg bg-blue-600 shadow flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Leads List</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          {/* Buyers Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600">
                <th className="p-2 border text-white">Name</th>
                <th className="p-2 border text-white">Phone</th>
                <th className="p-2 border text-white">Email</th>
                <th className="p-2 border text-white">City</th>
                <th className="p-2 border text-white">Property Type</th>
                <th className="p-2 border text-white">BHK</th>
                <th className="p-2 border text-white">Budget</th>
                <th className="p-2 border text-white">Timeline</th>
                <th className="p-2 border text-white">Status</th>
                <th className="p-2 border text-white">Updated At</th>
                <th className="p-2 border text-white">Edit</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-blue-50">
                  <td className="p-2 border">{buyer.fullName}</td>
                  <td className="p-2 border">{buyer.phone}</td>
                  <td className="p-2 border">{buyer.email || "-"}</td>
                  <td className="p-2 border">{buyer.city}</td>
                  <td className="p-2 border">{buyer.propertyType}</td>
                  <td className="p-2 border">{buyer.bhk || "-"}</td>
                  <td className="p-2 border">{buyer.budgetMin || "-"} - {buyer.budgetMax || "-"}</td>
                  <td className="p-2 border">{buyer.timeline}</td>
                  <td className="p-2 border">{buyer.status}</td>
                  <td className="p-2 border">{new Date(buyer.updatedAt).toLocaleString()}</td>
                  <td className="p-2 border text-center">
                    <a
                      href={`/buyers/${buyer.id}`}
                      className="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit/view
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex gap-2 mt-4 justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 border rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Loading component for Suspense fallback
function BuyersLoading() {
  return (
    <div className="p-4 min-h-screen bg-blue-50">
      <div className="mb-6 p-4 rounded-lg bg-blue-600 shadow flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Leads List</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center py-8">Loading buyers...</div>
      </div>
    </div>
  );
}

export default function BuyersPage() {
  return (
    <ProtectedRoute>
      <Header/>
      <Suspense fallback={<BuyersLoading />}>
        <BuyersContent />
      </Suspense>
    </ProtectedRoute>
  );
}