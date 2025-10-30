import { toast } from "react-toastify";

// Helper function for simulated delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get ApperClient instance
const getApperClient = () => {
  if (!window.ApperSDK) {
    console.error('ApperSDK not available');
    return null;
  }
  
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Get all bookings with optional filtering
const getAll = async (filters = {}) => {
  try {
    await delay(300);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "guest_name_c" } },
        { field: { Name: "room_number_c" } },
        { field: { Name: "check_in_date_c" } },
        { field: { Name: "check_out_date_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "total_amount_c" } },
        { field: { Name: "special_requests_c" } }
      ],
      orderBy: [{ fieldName: "check_in_date_c", sorttype: "DESC" }],
      pagingInfo: { limit: 100, offset: 0 }
    };

    // Add status filter if provided
    if (filters.status) {
      params.whereGroups = [{
        operator: "OR",
        subGroups: [{
          conditions: [{
            fieldName: "status_c",
            operator: "EqualTo",
            values: [filters.status]
          }],
          operator: ""
        }]
      }];
    }

    const response = await apperClient.fetchRecords('booking_c', params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (!response.data || response.data.length === 0) {
      return [];
    }

    // Transform database fields to UI format
    return response.data.map(booking => ({
      Id: booking.Id,
      guestName: booking.guest_name_c || '',
      roomNumber: booking.room_number_c || '',
      checkInDate: booking.check_in_date_c || '',
      checkOutDate: booking.check_out_date_c || '',
      status: booking.status_c || '',
      totalAmount: booking.total_amount_c || 0,
      specialRequests: booking.special_requests_c || ''
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error?.message || error);
    toast.error("Failed to fetch bookings");
    return [];
  }
};

// Get booking by ID
const getById = async (id) => {
  try {
    await delay(200);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "guest_name_c" } },
        { field: { Name: "room_number_c" } },
        { field: { Name: "check_in_date_c" } },
        { field: { Name: "check_out_date_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "total_amount_c" } },
        { field: { Name: "special_requests_c" } }
      ]
    };

    const response = await apperClient.getRecordById('booking_c', id, params);

    if (!response.success || !response.data) {
      console.error(response.message || 'Booking not found');
      return null;
    }

    const booking = response.data;
    return {
      Id: booking.Id,
      guestName: booking.guest_name_c || '',
      roomNumber: booking.room_number_c || '',
      checkInDate: booking.check_in_date_c || '',
      checkOutDate: booking.check_out_date_c || '',
      status: booking.status_c || '',
      totalAmount: booking.total_amount_c || 0,
      specialRequests: booking.special_requests_c || ''
    };
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error?.message || error);
    return null;
  }
};

// Create new booking
const create = async (bookingData) => {
  try {
    await delay(400);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    // Transform UI format to database format - only Updateable fields
    const records = Array.isArray(bookingData) ? bookingData : [bookingData];
    const params = {
      records: records.map(booking => ({
        guest_name_c: booking.guestName || '',
        room_number_c: booking.roomNumber || '',
        check_in_date_c: booking.checkInDate || '',
        check_out_date_c: booking.checkOutDate || '',
        status_c: booking.status || 'Confirmed',
        total_amount_c: parseFloat(booking.totalAmount) || 0,
        special_requests_c: booking.specialRequests || ''
      }))
    };

    const response = await apperClient.createRecord('booking_c', params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} bookings:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successful.length > 0) {
        toast.success(`${successful.length} booking(s) created successfully`);
      }

      return successful.map(r => r.data);
    }

    return [];
  } catch (error) {
    console.error("Error creating bookings:", error?.message || error);
    toast.error("Failed to create bookings");
    return [];
  }
};

// Update booking
const update = async (id, bookingData) => {
  try {
    await delay(400);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    // Transform UI format to database format - only Updateable fields plus Id
    const params = {
      records: [{
        Id: id,
        guest_name_c: bookingData.guestName || '',
        room_number_c: bookingData.roomNumber || '',
        check_in_date_c: bookingData.checkInDate || '',
        check_out_date_c: bookingData.checkOutDate || '',
        status_c: bookingData.status || '',
        total_amount_c: parseFloat(bookingData.totalAmount) || 0,
        special_requests_c: bookingData.specialRequests || ''
      }]
    };

    const response = await apperClient.updateRecord('booking_c', params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update booking:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
        return null;
      }

      if (successful.length > 0) {
        toast.success('Booking updated successfully');
        return successful[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating booking:", error?.message || error);
    toast.error("Failed to update booking");
    return null;
  }
};

// Delete booking
const deleteBooking = async (id) => {
  try {
    await delay(300);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    const params = {
      RecordIds: Array.isArray(id) ? id : [id]
    };

    const response = await apperClient.deleteRecord('booking_c', params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to delete booking(s):`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
        return false;
      }

      toast.success('Booking deleted successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error deleting booking:", error?.message || error);
    toast.error("Failed to delete booking");
    return false;
  }
};

// Update booking status
const updateStatus = async (id, newStatus) => {
  try {
    await delay(300);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    const params = {
      records: [{
        Id: id,
        status_c: newStatus
      }]
    };

    const response = await apperClient.updateRecord('booking_c', params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update booking status:`, failed);
        return null;
      }

      if (successful.length > 0) {
        toast.success('Booking status updated successfully');
        return successful[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating booking status:", error?.message || error);
    toast.error("Failed to update booking status");
    return null;
  }
};

// Get available rooms for booking
const getAvailableRooms = async () => {
  try {
    await delay(300);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not initialized');
    }

    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "room_number_c" } },
        { field: { Name: "room_type_c" } },
        { field: { Name: "price_per_night_c" } },
        { field: { Name: "status_c" } }
      ],
      whereGroups: [{
        operator: "OR",
        subGroups: [{
          conditions: [{
            fieldName: "status_c",
            operator: "EqualTo",
            values: ["Available"]
          }],
          operator: ""
        }]
      }],
      pagingInfo: { limit: 100, offset: 0 }
    };

    const response = await apperClient.fetchRecords('room_c', params);

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching available rooms:", error?.message || error);
    return [];
  }
};

export const bookingService = {
  getAll,
  getById,
  create,
  update,
  deleteBooking,
  updateStatus,
  getAvailableRooms,
};

export default bookingService;