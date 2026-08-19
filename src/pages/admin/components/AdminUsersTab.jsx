import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Stethoscope, 
  Building, 
  User,
  Filter,
  RefreshCw,
  X
} from "lucide-react";
import { 
  subscribeAllUsers, 
  updateUserRole, 
  updateUserStatus, 
  deleteUserRecord,
  addAuditLog 
} from "../../../firebase/firestore";

// Fallback initial sample users if Firestore table is empty
const defaultUsers = [
  { id: "usr_01", name: "Dr. Ananya Sharma", email: "doctor.sharma@medipulse.org", phone: "+91 98765 43210", role: "doctor", status: "Active", createdAt: "2026-01-15" },
  { id: "usr_02", name: "Soumen Pore", email: "soumen@medipulse.org", phone: "+91 98300 12345", role: "patient", status: "Active", createdAt: "2026-02-01" },
  { id: "usr_03", name: "System Administrator", email: "admin@medipulse.org", phone: "+91 98000 00000", role: "admin", status: "Active", createdAt: "2026-01-01" },
  { id: "usr_04", name: "City Central Pharmacy", email: "pharmacy@citycentral.org", phone: "+91 98111 22233", role: "clinic", status: "Active", createdAt: "2026-02-10" },
  { id: "usr_05", name: "Dr. Rajesh Kumar", email: "rajesh.k@medipulse.org", phone: "+91 98444 55566", role: "doctor", status: "Pending", createdAt: "2026-02-14" },
  { id: "usr_06", name: "Priya Mukherjee", email: "priya.m@gmail.com", phone: "+91 97222 33344", role: "patient", status: "Active", createdAt: "2026-02-16" }
];

export default function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("patient");
  const [newStatus, setNewStatus] = useState("Active");

  // Create User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState("patient");

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeAllUsers((dbUsers) => {
      if (isMounted) {
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
        } else {
          setUsers(defaultUsers);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      if (editingUser.id.startsWith("usr_")) {
        // Fallback local update
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, role: newRole, status: newStatus } : u
          )
        );
      } else {
        await updateUserRole(editingUser.id, newRole);
        await updateUserStatus(editingUser.id, newStatus);
      }

      await addAuditLog(
        "User Permission Updated",
        `Updated ${editingUser.name} (${editingUser.email}) role to ${newRole} & status to ${newStatus}`,
        "Admin"
      );

      alert(`Updated ${editingUser.name}'s role to ${newRole.toUpperCase()} (${newStatus}).`);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Error updating user: " + err.message);
    }
  };

  const handleDeleteUser = async (userObj) => {
    if (window.confirm(`Are you sure you want to remove user "${userObj.name}"? This action cannot be undone.`)) {
      try {
        if (userObj.id.startsWith("usr_")) {
          setUsers((prev) => prev.filter((u) => u.id !== userObj.id));
        } else {
          await deleteUserRecord(userObj.id);
        }
        await addAuditLog("User Deleted", `Removed user record for ${userObj.name} (${userObj.email})`, "Admin");
        alert(`User ${userObj.name} deleted.`);
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: `usr_${Date.now()}`,
      name: addName,
      email: addEmail,
      phone: addPhone,
      role: addRole,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setUsers([newUser, ...users]);
    addAuditLog("User Created", `Created new ${addRole} user: ${addName} (${addEmail})`, "Admin");
    alert(`Successfully registered new user: ${addName}`);
    setIsAddModalOpen(false);
    setAddName("");
    setAddEmail("");
    setAddPhone("");
    setAddRole("patient");
  };

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || "").includes(searchTerm);
    const matchesRole = roleFilter === "all" || (u.role || "patient").toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || (u.status || "Active").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (roleStr) => {
    switch ((roleStr || "patient").toLowerCase()) {
      case "admin":
        return <span className="status-badge away" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", display: "inline-flex", alignItems: "center", gap: "4px" }}><ShieldCheck size={12} /> Admin</span>;
      case "doctor":
        return <span className="status-badge confirmed" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", gap: "4px" }}><Stethoscope size={12} /> Doctor</span>;
      case "clinic":
      case "facility":
        return <span className="status-badge calling" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "4px" }}><Building size={12} /> Facility</span>;
      default:
        return <span className="status-badge confirmed" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><User size={12} /> Patient</span>;
    }
  };

  return (
    <div className="fade-in">
      {/* Search & Action Bar */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "260px", flexWrap: "wrap" }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: "180px" }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", fontSize: "14px", fontWeight: "500" }}
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
            <option value="clinic">Clinics / Facilities</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", fontSize: "14px", fontWeight: "500" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <button 
          className="primary-button" 
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content" }}
        >
          <UserPlus size={18} /> Register New User
        </button>
      </div>

      {/* User Table */}
      <div className="card-panel">
        <div className="panel-title-bar">
          <h2>User Accounts Roster ({filteredUsers.length})</h2>
          <span className="status-badge confirmed">Live Firestore Sync</span>
        </div>

        {loading ? (
          <p style={{ padding: "20px", color: "var(--color-text-secondary)" }}>Loading registered users...</p>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="patient-queue-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Contact Info</th>
                  <th>System Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: "14px", display: "block" }}>{u.name || "Unnamed User"}</strong>
                        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>ID: {u.id}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>
                        <div>{u.email}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{u.phone || "No phone listed"}</div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span className={`status-badge ${(u.status || "Active") === "Active" ? "confirmed" : (u.status || "Active") === "Pending" ? "calling" : "away"}`}>
                        {(u.status || "Active")}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      {u.createdAt ? (typeof u.createdAt === "string" ? u.createdAt : "Recent") : "Recent"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button 
                          className="secondary-button" 
                          style={{ padding: "5px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role || "patient");
                            setNewStatus(u.status || "Active");
                          }}
                        >
                          <Edit size={14} /> Edit Role
                        </button>
                        <button 
                          className="danger-button" 
                          style={{ padding: "5px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={() => handleDeleteUser(u)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--color-text-secondary)" }}>
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-content card-panel" style={{ maxWidth: "480px", width: "90%", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Manage User Role & Status</h2>
              <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>User Name</label>
                <div style={{ fontWeight: "700", fontSize: "16px", marginTop: "2px" }}>{editingUser.name}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{editingUser.email}</div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Assign System Role</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                >
                  <option value="patient">Patient (Standard Access)</option>
                  <option value="doctor">Doctor (Clinical Portal Access)</option>
                  <option value="admin">System Administrator (Full Access)</option>
                  <option value="clinic">Clinic / Pharmacy Manager</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Account Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                >
                  <option value="Active">Active (Granted Access)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Suspended">Suspended (Access Restricted)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-content card-panel" style={{ maxWidth: "480px", width: "90%", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Register System User</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Sameer Roy" 
                  value={addName} 
                  onChange={(e) => setAddName(e.target.value)} 
                  required
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="user@example.com" 
                  value={addEmail} 
                  onChange={(e) => setAddEmail(e.target.value)} 
                  required
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  value={addPhone} 
                  onChange={(e) => setAddPhone(e.target.value)} 
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Role</label>
                <select 
                  value={addRole} 
                  onChange={(e) => setAddRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">System Admin</option>
                  <option value="clinic">Clinic / Pharmacy Manager</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
