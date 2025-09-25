import { toast } from 'react-toastify';

class RoomService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "checkin_time_c"}},
          {"field": {"Name": "checkout_time_c"}},
          {"field": {"Name": "blocked_c"}},
          {"field": {"Name": "block_reason_c"}},
          {"field": {"Name": "last_updated_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_history_c"}}
        ]
      };

      const response = await this.apperClient.fetchRecords('room_c', params);
      
      if (!response.success) {
        console.error('Failed to fetch rooms:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(room => ({
        Id: room.Id,
        roomNumber: room.room_number_c,
        floor: room.floor_c,
        roomType: room.room_type_c,
        status: room.status_c,
        nightlyRate: room.nightly_rate_c,
        guestName: room.guest_name_c,
        checkinTime: room.checkin_time_c,
        checkoutTime: room.checkout_time_c,
        blocked: room.blocked_c,
        blockReason: room.block_reason_c,
        lastUpdated: room.last_updated_c,
        notes: room.notes_c ? JSON.parse(room.notes_c) : [],
        statusHistory: room.status_history_c ? JSON.parse(room.status_history_c) : []
      })) || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "checkin_time_c"}},
          {"field": {"Name": "checkout_time_c"}},
          {"field": {"Name": "blocked_c"}},
          {"field": {"Name": "block_reason_c"}},
          {"field": {"Name": "last_updated_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_history_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById('room_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error(`Room with ID ${id} not found`);
      }

      const room = response.data;
      return {
        Id: room.Id,
        roomNumber: room.room_number_c,
        floor: room.floor_c,
        roomType: room.room_type_c,
        status: room.status_c,
        nightlyRate: room.nightly_rate_c,
        guestName: room.guest_name_c,
        checkinTime: room.checkin_time_c,
        checkoutTime: room.checkout_time_c,
        blocked: room.blocked_c,
        blockReason: room.block_reason_c,
        lastUpdated: room.last_updated_c,
        notes: room.notes_c ? JSON.parse(room.notes_c) : [],
        statusHistory: room.status_history_c ? JSON.parse(room.status_history_c) : []
      };
    } catch (error) {
      console.error(`Error fetching room ${id}:`, error);
      throw error;
    }
  }

  async getByFloor(floor) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "status_c"}}
        ],
        where: [{"FieldName": "floor_c", "Operator": "EqualTo", "Values": [parseInt(floor)]}]
      };

      const response = await this.apperClient.fetchRecords('room_c', params);
      
      if (!response.success) {
        console.error('Failed to fetch rooms by floor:', response.message);
        return [];
      }

      return response.data?.map(room => ({
        Id: room.Id,
        roomNumber: room.room_number_c,
        floor: room.floor_c,
        status: room.status_c
      })) || [];
    } catch (error) {
      console.error('Error fetching rooms by floor:', error);
      return [];
    }
  }

  async getByStatus(status) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "room_type_c"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}]
      };

      const response = await this.apperClient.fetchRecords('room_c', params);
      
      if (!response.success) {
        console.error('Failed to fetch rooms by status:', response.message);
        return [];
      }

      return response.data?.map(room => ({
        Id: room.Id,
        roomNumber: room.room_number_c,
        status: room.status_c,
        roomType: room.room_type_c
      })) || [];
    } catch (error) {
      console.error('Error fetching rooms by status:', error);
      return [];
    }
  }

  async updateStatus(id, newStatus) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Get current room data for status history
      const currentRoom = await this.getById(id);
      const oldStatus = currentRoom.status;
      
      // Create status history entry
      const statusEntry = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        changedFrom: oldStatus,
        changedBy: 'Current User'
      };
      
      const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

      const params = {
        records: [{
          Id: parseInt(id),
          status_c: newStatus,
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        }]
      };

      // Clear guest info if room becomes available
      if (newStatus === 'Available') {
        params.records[0].guest_name_c = null;
        params.records[0].checkin_time_c = null;
        params.records[0].checkout_time_c = null;
      }

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          return await this.getById(id); // Return updated room data
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Failed to update room status');
      return null;
    }
  }

  async markCleaningComplete(id) {
    return await this.updateStatus(id, 'Available');
  }

  async updateRoom(id, updateData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          ...updateData,
          last_updated_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          return await this.getById(id);
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
      return null;
    }
  }

  async getRoomStats() {
    try {
      const rooms = await this.getAll();
      
      const stats = rooms.reduce((acc, room) => {
        acc[room.status] = (acc[room.status] || 0) + 1;
        return acc;
      }, {});

      const totalRooms = rooms.length;
      const occupancyRate = totalRooms > 0 ? ((stats.Occupied || 0) / totalRooms * 100).toFixed(1) : '0.0';
      
      return {
        total: totalRooms,
        available: stats.Available || 0,
        occupied: stats.Occupied || 0,
        maintenance: stats.Maintenance || 0,
        cleaning: stats.Cleaning || 0,
        occupancyRate: parseFloat(occupancyRate)
      };
    } catch (error) {
      console.error('Error fetching room stats:', error);
      return {
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        cleaning: 0,
        occupancyRate: 0
      };
    }
  }

  async assignGuest(roomId, guestData) {
    try {
      const currentRoom = await this.getById(roomId);
      if (currentRoom.status !== 'Available') {
        throw new Error(`Room ${currentRoom.roomNumber} is not available for assignment`);
      }

      const statusEntry = {
        status: 'Occupied',
        timestamp: new Date().toISOString(),
        changedFrom: 'Available',
        changedBy: 'Current User',
        guestName: guestData.guestName
      };
      
      const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

      const params = {
        records: [{
          Id: parseInt(roomId),
          status_c: 'Occupied',
          guest_name_c: guestData.guestName,
          checkin_time_c: guestData.checkinTime || new Date().toISOString(),
          checkout_time_c: guestData.checkoutTime,
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return await this.getById(roomId);
    } catch (error) {
      console.error('Error assigning guest:', error);
      toast.error('Failed to assign guest');
      return null;
    }
  }

  async checkoutGuest(roomId) {
    try {
      const currentRoom = await this.getById(roomId);
      if (currentRoom.status !== 'Occupied') {
        throw new Error(`Room ${currentRoom.roomNumber} is not currently occupied`);
      }

      const statusEntry = {
        status: 'Cleaning',
        timestamp: new Date().toISOString(),
        changedFrom: 'Occupied',
        changedBy: 'Current User',
        note: 'Guest checkout completed'
      };
      
      const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

      const params = {
        records: [{
          Id: parseInt(roomId),
          status_c: 'Cleaning',
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return await this.getById(roomId);
    } catch (error) {
      console.error('Error checking out guest:', error);
      toast.error('Failed to checkout guest');
      return null;
    }
  }

  async bulkUpdateStatus(roomIds, newStatus) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateRecords = [];
      
      for (const roomId of roomIds) {
        const currentRoom = await this.getById(roomId);
        const statusEntry = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          changedFrom: currentRoom.status,
          changedBy: 'Current User',
          note: 'Bulk status change'
        };
        
        const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

        const recordData = {
          Id: parseInt(roomId),
          status_c: newStatus,
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        };

        // Clear guest info if room becomes available
        if (newStatus === 'Available') {
          recordData.guest_name_c = null;
          recordData.checkin_time_c = null;
          recordData.checkout_time_c = null;
        }

        updateRecords.push(recordData);
      }

      const params = { records: updateRecords };
      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Return updated rooms
      const updatedRooms = [];
      for (const roomId of roomIds) {
        try {
          const room = await this.getById(roomId);
          updatedRooms.push(room);
        } catch (error) {
          console.error(`Failed to fetch updated room ${roomId}:`, error);
        }
      }
      
      return updatedRooms;
    } catch (error) {
      console.error('Error bulk updating room status:', error);
      toast.error('Failed to update room statuses');
      return [];
    }
  }

  async bulkBlockRooms(roomIds, reason) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateRecords = [];
      
      for (const roomId of roomIds) {
        const currentRoom = await this.getById(roomId);
        const statusEntry = {
          status: 'Out of Order',
          timestamp: new Date().toISOString(),
          changedFrom: currentRoom.status,
          changedBy: 'Current User',
          note: `Room blocked - ${reason}`
        };
        
        const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

        updateRecords.push({
          Id: parseInt(roomId),
          status_c: 'Out of Order',
          blocked_c: true,
          block_reason_c: reason,
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        });
      }

      const params = { records: updateRecords };
      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Return updated rooms
      const updatedRooms = [];
      for (const roomId of roomIds) {
        try {
          const room = await this.getById(roomId);
          updatedRooms.push(room);
        } catch (error) {
          console.error(`Failed to fetch updated room ${roomId}:`, error);
        }
      }
      
      return updatedRooms;
    } catch (error) {
      console.error('Error bulk blocking rooms:', error);
      toast.error('Failed to block rooms');
      return [];
    }
  }

  async blockRoom(roomId, reason) {
    try {
      const currentRoom = await this.getById(roomId);
      const statusEntry = {
        status: 'Out of Order',
        timestamp: new Date().toISOString(),
        changedFrom: currentRoom.status,
        changedBy: 'Current User',
        note: `Room blocked - ${reason}`
      };
      
      const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

      const params = {
        records: [{
          Id: parseInt(roomId),
          status_c: 'Out of Order',
          blocked_c: true,
          block_reason_c: reason,
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return await this.getById(roomId);
    } catch (error) {
      console.error('Error blocking room:', error);
      toast.error('Failed to block room');
      return null;
    }
  }

  async unblockRoom(roomId) {
    try {
      const currentRoom = await this.getById(roomId);
      const statusEntry = {
        status: 'Available',
        timestamp: new Date().toISOString(),
        changedFrom: currentRoom.status,
        changedBy: 'Current User',
        note: 'Room unblocked and made available'
      };
      
      const updatedHistory = [...(currentRoom.statusHistory || []), statusEntry];

      const params = {
        records: [{
          Id: parseInt(roomId),
          status_c: 'Available',
          blocked_c: false,
          block_reason_c: null,
          last_updated_c: new Date().toISOString(),
          status_history_c: JSON.stringify(updatedHistory)
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return await this.getById(roomId);
    } catch (error) {
      console.error('Error unblocking room:', error);
      toast.error('Failed to unblock room');
      return null;
    }
  }

  async addNote(roomId, noteContent) {
    try {
      const currentRoom = await this.getById(roomId);
      const newNote = {
        id: Date.now(),
        content: noteContent,
        timestamp: new Date().toISOString(),
        addedBy: 'Current User',
        type: 'General'
      };

      const updatedNotes = [...(currentRoom.notes || []), newNote];

      const params = {
        records: [{
          Id: parseInt(roomId),
          notes_c: JSON.stringify(updatedNotes),
          last_updated_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return await this.getById(roomId);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
      return null;
    }
  }

  async deleteNote(roomId, noteId) {
    try {
      const currentRoom = await this.getById(roomId);
      const updatedNotes = (currentRoom.notes || []).filter(note => note.id !== noteId);

      const params = {
        records: [{
          Id: parseInt(roomId),
          notes_c: JSON.stringify(updatedNotes),
          last_updated_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord('room_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return await this.getById(roomId);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      return null;
    }
  }

  async searchRooms(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAll();
      }

      const searchTerm = query.toLowerCase().trim();
      
      // Search by room number or guest name
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "status_c"}}
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {"fieldName": "room_number_c", "operator": "Contains", "values": [searchTerm]}
              ]
            },
            {
              conditions: [
                {"fieldName": "guest_name_c", "operator": "Contains", "values": [searchTerm]}
              ]
            }
          ]
        }]
      };

      const response = await this.apperClient.fetchRecords('room_c', params);
      
      if (!response.success) {
        console.error('Failed to search rooms:', response.message);
        return [];
      }

      return response.data?.map(room => ({
        Id: room.Id,
        roomNumber: room.room_number_c,
        guestName: room.guest_name_c,
        status: room.status_c
      })) || [];
    } catch (error) {
      console.error('Error searching rooms:', error);
      return [];
    }
  }
}

export const roomService = new RoomService();