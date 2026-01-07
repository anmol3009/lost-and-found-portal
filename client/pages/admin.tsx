import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [lostReports, setLostReports] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const ADMIN_PASSWORD = "pass@123"; // change if needed

  // ✅ LOGIN HANDLER
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success("Access granted");
      fetchAllData();
      fetchItems();
    } else {
      toast.error("Incorrect password");
    }
  };

  // ✅ FETCH FOUND ITEMS
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/found");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load found items");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH LOST & CLAIM DATA TOGETHER
  const fetchAllData = async () => {
    try {
      const lostRes = await fetch("http://localhost:5000/api/lost");
      const lostData = await lostRes.json();
      setLostReports(lostData);

      const claimRes = await fetch("http://localhost:5000/api/claims");
      const claimData = await claimRes.json();
      setClaims(claimData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      fetchItems();
    }
  }, [isAuthenticated]);

  // ✅ APPROVE FOUND ITEM
  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/found/${id}/approve`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Report ${id} approved!`);
        fetchItems();
      }
    } catch (error) {
      console.error("Error approving item:", error);
      toast.error("Approval failed");
    }
  };

  // Delete Claim
const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this claim?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/deleteClaim/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Claim deleted successfully!");
      fetchAllData(); // 👈 refresh data here
    } else {
      alert("Failed to delete claim.");
    }
  } catch (err) {
    console.error(err);
  }
};

// Update Status (Approve/Reject)
const handleUpdateStatus = async (id: number, status: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/updateClaim/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      alert(`Claim ${status} successfully!`);
      fetchAllData(); // 👈 refresh data here
    } else {
      alert("Failed to update claim status.");
    }
  } catch (err) {
    console.error(err);
  }
};


  // ✅ DELETE LOST REPORT
  const handleDeleteLost = async (id: number) => {
    if (!confirm("Delete this lost report?")) return;
    await fetch(`http://localhost:5000/api/lost/${id}`, { method: "DELETE" });
    toast.success("Lost report deleted!");
    fetchAllData();
  };

  // ✅ EDIT LOST REPORT (placeholder)
  const handleEditLost = (report: any) => {
    console.log("Edit Lost Item:", report);
    toast.info("Edit feature coming soon!");
  };

  // ✅ APPROVE CLAIM
  const handleApproveClaim = async (id: number) => {
    await fetch(`http://localhost:5000/api/claims/${id}/approve`, {
      method: "PATCH",
    });
    toast.success("Claim approved!");
    fetchAllData();
  };

  // ✅ DELETE CLAIM
  const handleDeleteClaim = async (id: number) => {
    if (!confirm("Delete this claim?")) return;
    await fetch(`http://localhost:5000/api/claims/${id}`, { method: "DELETE" });
    toast.success("Claim deleted!");
    fetchAllData();
  };

  // ✅ LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-2xl p-6 w-80 text-center"
        >
          <h2 className="text-xl font-bold mb-4">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-2 rounded mb-4"
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
        </form>
      </div>
    );
  }

  // ✅ LOADING STATE
  if (loading) return <p className="text-center mt-8">Loading reports...</p>;

  return (
    <div className="container mx-auto p-6 space-y-12">
      {/* ---------------- FOUND ITEMS ---------------- */}
      <h1 className="text-3xl font-bold mb-6">Admin Panel — Review Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden shadow-md border">
            <div className="aspect-[4/3] bg-muted">
              {item.photoPath ? (
                <img
                  src={`http://localhost:5000${item.photoPath}`}
                  alt={item.itemName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{item.itemName}</h3>
              <p className="text-sm text-gray-500">{item.locationFound}</p>
              <p className="text-xs text-gray-500">{item.dateFound}</p>
              <p className="mt-2 text-sm">{item.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Uploader: {item.uploaderName}
              </p>
              <p className="text-xs text-gray-500">Contact: {item.contact}</p>

              <div className="mt-4 flex gap-2">
                {!item.approved ? (
                  <Button
                    onClick={() => handleApprove(item.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                ) : (
                  <Button disabled className="bg-gray-400">
                    Approved
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center mt-10 text-gray-500">No reports yet.</p>
      )}

      {/* ---------------- LOST ITEM REPORTS ---------------- */}
      <div>
        <h2 className="text-2xl font-bold mt-12 mb-4">Lost Item Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Item Name</th>
                <th className="py-2 px-4 border">Location Lost</th>
                <th className="py-2 px-4 border">Date Lost</th>
                <th className="py-2 px-4 border">Description</th>
                <th className="py-2 px-4 border">Reporter</th>
                <th className="py-2 px-4 border">Contact</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lostReports.length > 0 ? (
                lostReports.map((report) => (
                  <tr key={report.id}>
                    <td className="py-2 px-4 border">{report.itemName}</td>
                    <td className="py-2 px-4 border">{report.locationLost}</td>
                    <td className="py-2 px-4 border">{report.dateLost}</td>
                    <td className="py-2 px-4 border">{report.description}</td>
                    <td className="py-2 px-4 border">{report.reporterName}</td>
                    <td className="py-2 px-4 border">{report.contact}</td>
                    <td className="py-2 px-4 border flex gap-2 justify-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => handleEditLost(report)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => handleDeleteLost(report.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-4 text-gray-500 border"
                  >
                    No lost reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- ITEM CLAIMS ---------------- */}
      <div>
        <h2 className="text-2xl font-bold mt-12 mb-4">Item Claims</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Item ID</th>
                <th className="py-2 px-4 border">Claimer Name</th>
                <th className="py-2 px-4 border">Contact</th>
                <th className="py-2 px-4 border">Evidence / Details</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <tr key={claim.id}>
                    <td className="py-2 px-4 border">{claim.itemId}</td>
                    <td className="py-2 px-4 border">{claim.name}</td>
                    <td className="py-2 px-4 border">{claim.contact}</td>
                    <td className="py-2 px-4 border">{claim.proof}</td>
                    <td className="py-2 px-4 border">{claim.status}</td>
                    <td className="py-2 px-4 border flex gap-2 justify-center">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => handleApproveClaim(claim.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => handleDeleteClaim(claim.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 border"
                  >
                    No claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
