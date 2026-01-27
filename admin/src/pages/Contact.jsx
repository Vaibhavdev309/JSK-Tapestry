import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useAdminContext } from "../Context/AdminContext";

const Contact = ({ token }) => {
  const { refreshCounts } = useAdminContext();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchContacts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      params.append("page", pagination.page);
      params.append("limit", pagination.limit);

      const response = await axios.get(
        `${backendUrl}/api/contact?${params.toString()}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setContacts(response.data.contacts);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [token, statusFilter, pagination.page]);

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/contact/${contactId}/status`,
        { status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchContacts();
        if (selectedContact?._id === contactId) {
          setSelectedContact(response.data.contact);
        }
        // Refresh counts when contact status changes (from "new" to something else)
        if (refreshCounts) {
          refreshCounts();
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/contact/${contactId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Contact message deleted");
        fetchContacts();
        if (selectedContact?._id === contactId) {
          setSelectedContact(null);
        }
        // Refresh counts when contact is deleted
        if (refreshCounts) {
          refreshCounts();
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error(error.response?.data?.message || "Failed to delete contact");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-yellow-100 text-yellow-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Contact Messages</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm sm:text-base"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Contact List */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {contacts.length === 0 ? (
            <div className="card-tapestry p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-gray-500">No contact messages found</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                type="button"
                className={`w-full text-left card-tapestry p-3 sm:p-4 lg:p-5 cursor-pointer transition-all ${
                  selectedContact?._id === contact._id
                    ? "border-2 border-amber-500"
                    : "hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedContact(contact);
                  // Auto-mark as "read" when selected if it's "new"
                  if (contact.status === "new") {
                    handleStatusChange(contact._id, "read");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedContact(contact);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 break-words">
                      {contact.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 break-words">{contact.email}</p>
                    {contact.subject && (
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-1 sm:mb-2 break-words">
                        {contact.subject}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">
                      {contact.message}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ml-2 sm:ml-3 flex-shrink-0 ${getStatusColor(
                      contact.status
                    )}`}
                  >
                    {contact.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {contact.userId && (
                    <span className="text-xs text-blue-600">Registered User</span>
                  )}
                </div>
              </button>
            ))
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
              >
                Previous
              </button>
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.pages}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Contact Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <div className="card-tapestry p-4 sm:p-5 lg:p-6 sticky top-4 sm:top-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Contact Details</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Name
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Email
                  </label>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-sm sm:text-base text-blue-600 hover:text-blue-700 break-words"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">
                    {selectedContact.subject || "General Inquiry"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Message
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap break-words">
                    {selectedContact.message}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Submitted
                  </label>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {new Date(selectedContact.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {selectedContact.userId && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      User
                    </label>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {selectedContact.userId.name} ({selectedContact.userId.email})
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Status
                  </label>
                  <select
                    value={selectedContact.status}
                    onChange={(e) =>
                      handleStatusChange(selectedContact._id, e.target.value)
                    }
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm sm:text-base"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || "Your Inquiry"}`}
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center text-xs sm:text-sm font-medium transition-colors"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selectedContact._id)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-tapestry p-6 text-center text-gray-500">
              <p>Select a contact message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
