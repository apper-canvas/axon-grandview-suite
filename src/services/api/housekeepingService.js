import { roomService } from '@/services/api/roomService';
import { staffService } from '@/services/api/staffService';
import { toast } from 'react-toastify';

class HousekeepingService {
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

  // Task Management - Using work_order_c table for housekeeping tasks
  async getAllTasks() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "room_id_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "assigned_name_c"}},
          {"field": {"Name": "estimated_hours_c"}},
          {"field": {"Name": "actual_hours_c"}},
          {"field": {"Name": "started_at_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "reported_by_c"}}
        ],
        where: [{"FieldName": "category_c", "Operator": "EqualTo", "Values": ["housekeeping"]}],
        orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords('work_order_c', params);
      
      if (!response.success) {
        console.error('Failed to fetch housekeeping tasks:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(task => ({
        Id: task.Id,
        title: task.title_c,
        description: task.description_c,
        priority: task.priority_c,
        status: task.status_c,
        roomNumber: task.room_number_c,
        roomId: task.room_id_c?.Id || task.room_id_c,
        assignedTo: task.assigned_to_c,
        assignedStaff: task.assigned_name_c,
        estimatedTime: task.estimated_hours_c ? task.estimated_hours_c * 60 : 30,
        actualTime: task.actual_hours_c ? task.actual_hours_c * 60 : null,
        startTime: task.started_at_c,
        completedTime: task.completed_at_c,
        createdAt: task.created_at_c,
        createdBy: task.reported_by_c,
        taskType: 'standard_cleaning'
      })) || [];
    } catch (error) {
      console.error('Error fetching housekeeping tasks:', error);
      return [];
    }
  }

  async getTasksByStatus(status) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "assigned_name_c"}}
        ],
        where: [
          {"FieldName": "category_c", "Operator": "EqualTo", "Values": ["housekeeping"]},
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}
        ]
      };

      const response = await this.apperClient.fetchRecords('work_order_c', params);
      
      if (!response.success) {
        console.error('Failed to fetch tasks by status:', response.message);
        return [];
      }

      return response.data?.map(task => ({
        Id: task.Id,
        title: task.title_c,
        priority: task.priority_c,
        status: task.status_c,
        roomNumber: task.room_number_c,
        assignedStaff: task.assigned_name_c
      })) || [];
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      return [];
    }
  }

  async getTaskById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "assigned_name_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById('work_order_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error(`Task with ID ${id} not found`);
      }

      const task = response.data;
      return {
        Id: task.Id,
        title: task.title_c,
        description: task.description_c,
        priority: task.priority_c,
        status: task.status_c,
        roomNumber: task.room_number_c,
        assignedStaff: task.assigned_name_c
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: taskData.title || 'Housekeeping Task',
          title_c: taskData.title,
          description_c: taskData.description,
          priority_c: taskData.priority || 'medium',
          status_c: 'open',
          category_c: 'housekeeping',
          room_number_c: taskData.roomNumber,
          room_id_c: taskData.roomId,
          reported_by_c: 'Current User',
          reported_at_c: new Date().toISOString(),
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord('work_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          toast.success('Task created successfully');
          return successful[0].data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  }

  async updateTaskStatus(id, newStatus, updates = {}) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateData = {
        status_c: newStatus,
        updated_at_c: new Date().toISOString(),
        ...updates
      };

      // Handle status-specific updates
      if (newStatus === 'in_progress') {
        updateData.started_at_c = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at_c = new Date().toISOString();
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateData
        }]
      };

      const response = await this.apperClient.updateRecord('work_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          toast.success(`Task ${newStatus.replace('_', ' ')}`);
          return successful[0].data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      return null;
    }
  }

  // Staff Management - Delegate to staffService
  async getAllStaff() {
    try {
      return await staffService.getAllStaff();
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  }

  async getAvailableStaff() {
    try {
      const staff = await staffService.getAllStaff();
      return staff.filter(member => member.status_c === 'available');
    } catch (error) {
      console.error('Error fetching available staff:', error);
      return [];
    }
  }

  async getStaffById(id) {
    try {
      return await staffService.getStaffById(id);
    } catch (error) {
      console.error(`Error fetching staff ${id}:`, error);
      return null;
    }
  }

  async getHousekeepingStats() {
    try {
      const tasks = await this.getAllTasks();
      
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(t => t.status === 'open').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
      const completedToday = tasks.filter(t => 
        t.status === 'completed' && 
        new Date(t.completedTime).toDateString() === new Date().toDateString()
      ).length;
      
      const averageTime = tasks
        .filter(t => t.actualTime)
        .reduce((sum, t) => sum + t.actualTime, 0) / 
        tasks.filter(t => t.actualTime).length || 0;

      const staff = await this.getAllStaff();
      const staffStats = staff.map(member => ({
        ...member,
        activeAssignments: member.active_assignments_c || 0,
        completedToday: member.completed_today_c || 0
      }));

      return {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedToday,
        averageTime: Math.round(averageTime),
        staffStats
      };
    } catch (error) {
      console.error('Error fetching housekeeping stats:', error);
      return {
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedToday: 0,
        averageTime: 0,
        staffStats: []
      };
    }
  }

  async assignTask(taskId, staffId) {
    try {
      const staff = await this.getStaffById(staffId);
      if (!staff) {
        throw new Error(`Staff member with ID ${staffId} not found`);
      }

      return await this.updateTaskStatus(taskId, 'assigned', {
        assigned_to_c: parseInt(staffId),
        assigned_name_c: staff.name_c,
        assigned_at_c: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
      return null;
    }
  }

  async bulkAssignTasks(assignments) {
    try {
      const updatedTasks = [];
      
      for (const assignment of assignments) {
        const { roomIds, staffId, specialInstructions, supplies, priority } = assignment;
        
        for (const roomId of roomIds) {
          // Create new housekeeping task
          const room = await roomService.getById(roomId);
          const staff = await this.getStaffById(staffId);
          
          const taskData = {
            title: `Housekeeping - Room ${room.room_number_c}`,
            description: specialInstructions || 'Standard cleaning',
            roomNumber: room.room_number_c,
            roomId: roomId,
            priority: priority || 'medium'
          };

          const newTask = await this.createTask(taskData);
          if (newTask) {
            await this.assignTask(newTask.Id, staffId);
            updatedTasks.push(newTask);
          }
        }
      }
      
      toast.success(`${updatedTasks.length} tasks assigned successfully`);
      return updatedTasks;
    } catch (error) {
      console.error('Error bulk assigning tasks:', error);
      toast.error('Failed to assign tasks');
      return [];
    }
  }

  async deleteTask(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('work_order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      toast.success('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  }
}

export const housekeepingService = new HousekeepingService();

export const housekeepingService = new HousekeepingService();