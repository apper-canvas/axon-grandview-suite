import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import { roomService } from "@/services/api/roomService";
import React from "react";
import Error from "@/components/ui/Error";

class MaintenanceService {
  constructor() {
this.apperClient = null;
    this.workOrderFields = [
      { field: { Name: 'Id' } },
      { field: { Name: 'title_c' } },
      { field: { Name: 'description_c' } },
      { field: { Name: 'priority_c' } },
      { field: { Name: 'status_c' } },
      { field: { Name: 'roomNumber_c' } },
      { field: { Name: 'assignedTo_c' } },
      { field: { Name: 'estimatedHours_c' } },
      { field: { Name: 'category_c' } },
      { field: { Name: 'createdAt_c' } },
      { field: { Name: 'updatedAt_c' } }
    ];
    this.equipmentFields = [
      { field: { Name: 'Id' } },
      { field: { Name: 'name_c' } },
      { field: { Name: 'type_c' } },
      { field: { Name: 'status_c' } },
      { field: { Name: 'lastMaintenance_c' } },
      { field: { Name: 'nextMaintenance_c' } }
    ];
    this.vendorFields = [
      { field: { Name: 'Id' } },
      { field: { Name: 'name_c' } },
      { field: { Name: 'service_c' } },
      { field: { Name: 'contact_c' } },
      { field: { Name: 'phone_c' } },
      { field: { Name: 'email_c' } }
    ];
}

  initializeClient() {
    if (!this.apperClient) {
      this.apperClient = getApperClient();
    }
    return this.apperClient;
  }

  // Work Orders
  async getAllWorkOrders() {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Database connection not available');
        return [];
      }

      const response = await apperClient.fetchRecords('work_order_c', {
        fields: this.workOrderFields
      });

      if (!response.success) {
        console.error('Failed to fetch work orders:', response.message);
        toast.error(response.message);
        return [];
      }

      // Map database fields to component-expected format
      return (response.data || []).map(order => ({
        Id: order.Id,
        title: order.title_c || '',
        description: order.description_c || '',
        priority: order.priority_c || 'medium',
        status: order.status_c || 'open',
        roomNumber: order.roomNumber_c || null,
        assignedTo: order.assignedTo_c?.Id || null,
        assignedName: order.assignedTo_c?.Name || 'Unassigned',
        estimatedHours: order.estimatedHours_c || null,
        category: order.category_c || '',
        createdAt: order.createdAt_c || new Date().toISOString(),
        updatedAt: order.updatedAt_c || new Date().toISOString(),
        notes: order.notes_c || []
      }));
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast.error('Failed to load work orders');
      return [];
    }
  }

  async getWorkOrderById(id) {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return null;
      }

      const response = await apperClient.getRecordById('work_order_c', parseInt(id), {
        fields: this.workOrderFields
      });

      if (!response.success) {
        console.error(`Failed to fetch work order ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      if (!response.data) {
        return null;
      }

      const order = response.data;
      return {
        Id: order.Id,
        title: order.title_c || '',
        description: order.description_c || '',
        priority: order.priority_c || 'medium',
        status: order.status_c || 'open',
        roomNumber: order.roomNumber_c || null,
        assignedTo: order.assignedTo_c?.Id || null,
        assignedName: order.assignedTo_c?.Name || 'Unassigned',
        estimatedHours: order.estimatedHours_c || null,
        category: order.category_c || '',
        createdAt: order.createdAt_c || new Date().toISOString(),
        updatedAt: order.updatedAt_c || new Date().toISOString(),
        notes: order.notes_c || []
      };
    } catch (error) {
      console.error(`Error fetching work order ${id}:`, error);
      return null;
    }
  }

  async createWorkOrder(data) {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Database connection not available');
        return null;
      }

      // Only include Updateable fields
      const payload = {
        records: [{
          title_c: data.title || '',
          description_c: data.description || '',
          priority_c: data.priority || 'medium',
          status_c: data.status || 'open',
          roomNumber_c: data.roomNumber || null,
          assignedTo_c: data.assignedTo ? parseInt(data.assignedTo) : null,
          estimatedHours_c: data.estimatedHours || null,
          category_c: data.category || ''
        }]
      };

      const response = await apperClient.createRecord('work_order_c', payload);

      if (!response.success) {
        console.error('Failed to create work order:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create work order:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Work order created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating work order:', error);
      toast.error('Failed to create work order');
      return null;
    }
  }

  async updateWorkOrder(id, data) {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Database connection not available');
        return null;
      }

      // Only include Updateable fields that are provided
      const updateFields = { Id: parseInt(id) };
      if (data.title !== undefined) updateFields.title_c = data.title;
      if (data.description !== undefined) updateFields.description_c = data.description;
      if (data.priority !== undefined) updateFields.priority_c = data.priority;
      if (data.status !== undefined) updateFields.status_c = data.status;
      if (data.roomNumber !== undefined) updateFields.roomNumber_c = data.roomNumber;
      if (data.assignedTo !== undefined) updateFields.assignedTo_c = data.assignedTo ? parseInt(data.assignedTo) : null;
      if (data.estimatedHours !== undefined) updateFields.estimatedHours_c = data.estimatedHours;
      if (data.category !== undefined) updateFields.category_c = data.category;

      const payload = {
        records: [updateFields]
      };

      const response = await apperClient.updateRecord('work_order_c', payload);

      if (!response.success) {
        console.error('Failed to update work order:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update work order:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Work order updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating work order:', error);
      toast.error('Failed to update work order');
      return null;
    }
  }

  async updateWorkOrderStatus(id, status) {
    return this.updateWorkOrder(id, { status });
  }

  async deleteWorkOrder(id) {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Database connection not available');
        return false;
      }

      const payload = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('work_order_c', payload);

      if (!response.success) {
        console.error('Failed to delete work order:', response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete work order:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Work order deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error deleting work order:', error);
      toast.error('Failed to delete work order');
      return false;
    }
  }

  // Statistics
  async getMaintenanceStats() {
    try {
      const orders = await this.getAllWorkOrders();

      const stats = {
        active: orders.filter(o => ['open', 'in_progress'].includes(o.status)).length,
        open: orders.filter(o => o.status === 'open').length,
        inProgress: orders.filter(o => o.status === 'in_progress').length,
        onHold: orders.filter(o => o.status === 'on_hold').length,
        completed: orders.filter(o => o.status === 'completed').length,
        highPriority: orders.filter(o => o.priority === 'high').length,
        avgCompletionTime: 4.5 // This would require additional calculation logic based on actual completion times
      };

      return stats;
    } catch (error) {
      console.error('Error calculating maintenance stats:', error);
      return {
        active: 0,
        open: 0,
        inProgress: 0,
        onHold: 0,
        completed: 0,
        highPriority: 0,
        avgCompletionTime: 0
      };
    }
  }

  // Equipment
  async getAllEquipment() {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Database connection not available');
        return [];
      }

      const response = await apperClient.fetchRecords('equipment_c', {
        fields: this.equipmentFields
      });

      if (!response.success) {
        console.error('Failed to fetch equipment:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
      return [];
    }
  }

  // Vendors
  async getAllVendors() {
    try {
      const apperClient = this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Database connection not available');
        return [];
      }

      const response = await apperClient.fetchRecords('vendor_c', {
        fields: this.vendorFields
      });

if (!response.success) {
        console.error('Failed to fetch vendors:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
      return [];
    }
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;