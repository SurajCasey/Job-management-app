import { FaUsers, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import EmptyState from "../shared/EmptyState"
import { useEffect, useState } from "react"
import AddClientForm from "../forms/AddClientForm"
import toast from "react-hot-toast"
import { supabase } from "../../lib/supabaseClient"
import LoadingSpinner from "../shared/LoadingSpinner"
import { deleteClient } from "../../utils/helpers"

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes?: string;
  created_at: string;
}

const Clients = () => {
  const [showAddClient, setShowAddClient] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  const fetchClients = async () => {
    try {
      setLoading(true)
      
      const { data: fetchedClients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, email, phone, company, address, notes, created_at")
        .order("created_at", { ascending: false })

      if (clientsError) throw clientsError

      setClients(fetchedClients || [])
    } catch (error) {
      console.error("Error fetching client's data", error)
      toast.error("Error loading client's data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleAddClient = () => {
    setShowAddClient(true)
  }

  const handleCloseForm = () => {
    setShowAddClient(false)
  }

  const handleClientAdded = () => {
    toast.success("Client added successfully!")
    fetchClients()
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return
    }

    const result = await deleteClient(clientId)

    if (result.success) {
      toast.success("Client deleted successfully.")
      fetchClients()
    } else {
      toast.error(result.error || "Failed to delete client")
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading clients..." />
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Clients</h1>
            <p className="text-gray-600">Manage and organize all your clients</p>
          </div>
          {clients.length > 0 && !showAddClient && (
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              onClick={handleAddClient}
            >
              + Add Client
            </button>
          )}
        </div>

        {showAddClient ? (
          <div>
            <AddClientForm
              onClose={handleCloseForm}
              onSuccess={handleClientAdded}
            />
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<FaUsers size={64} />}
            title="No Clients Yet"
            description="You haven't added any clients yet. Click below to add your first client."
            action={{
              label: "Add Client",
              onClick: handleAddClient
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all 
                  duration-300 overflow-hidden border border-gray-100
                "
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold">{client.name}</h3>
                      <p className="text-blue-100 mt-1">{client.company}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-gray-700 hover:text-blue-600 transition-colors break-all"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-gray-700 hover:text-green-600 transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                      <p className="text-gray-700">{client.address}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                      <p className="text-gray-600 text-sm">{client.notes}</p>
                    </div>
                  )}

                  {/* Date Added */}
                  <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                    Added {new Date(client.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Card Footer - Actions */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 
                    transition-colors font-medium flex items-center justify-center gap-2
                    "
                  >
                    <FaEdit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg 
                      hover:bg-red-100 transition-colors font-medium flex items-center 
                      justify-center gap-2
                    "
                  >
                    <FaTrash size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Clients