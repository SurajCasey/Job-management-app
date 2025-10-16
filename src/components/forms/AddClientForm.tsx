import { useState } from "react";
import toast from "react-hot-toast";
import { addClient } from "../../utils/helpers";
import { FaTimes } from "react-icons/fa";

interface AddClientFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddClientForm = ({ onClose, onSuccess }: AddClientFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return toast.error("Enter client's name");
    if (!formData.email.trim()) return toast.error("Please enter client's email.");
    if (!formData.company.trim()) return toast.error("Please enter company name");
    if (!formData.address.trim()) return toast.error("Please enter company's address");

    setIsLoading(true);

    try {
      const result = await addClient(formData);
      if (!result.success) return toast.error(result.error || "Adding client failed");

      toast.success("Client added successfully!");
      setFormData({ name: "", email: "", phone: "", company: "", address: "", notes: "" });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("An unexpected error occurred while adding client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <FaTimes size={24} />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Add New Client</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter Client Name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter Client's Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter Client's Phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Company</label>
            <input
              name="company"
              type="text"
              placeholder="Enter Company Name"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Address</label>
            <input
              name="address"
              type="text"
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              className="border border-gray-300 rounded-xl px-4 py-2 h-28 resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {isLoading ? "Adding..." : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientForm;
