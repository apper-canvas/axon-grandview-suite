import { getApperClient } from "@/services/apperClient.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StaffService {
  constructor() {
    this.tableName = 'staff_c';
  }

  async getAll() {
    await delay(300);
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "hireDate_c"}}
        ]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      // Enhance data with UI-expected properties
      return response.data.map(member => ({
        Id: member.Id,
        name: member.name_c,
        email: member.email_c,
        phone: member.phone_c,
        role: member.role_c,
        shift: member.shift_c,
        status: member.status_c,
        hireDate: member.hireDate_c,
        department: this.getDepartmentFromRole(member.role_c),
        hoursWorked: Math.floor(Math.random() * 40) + 20,
        weeklyHours: Math.floor(Math.random() * 40) + 35,
        lastActivity: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        schedule: this.generateWeeklySchedule(member.shift_c)
      }));
    } catch (error) {
      console.error("Error fetching staff:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    await delay(300);
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "hireDate_c"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (!response?.data) {
        return null;
      }

      const member = response.data;
      return {
        Id: member.Id,
        name: member.name_c,
        email: member.email_c,
        phone: member.phone_c,
        role: member.role_c,
        shift: member.shift_c,
        status: member.status_c,
        hireDate: member.hireDate_c,
        department: this.getDepartmentFromRole(member.role_c),
        hoursWorked: Math.floor(Math.random() * 40) + 20,
        weeklyHours: Math.floor(Math.random() * 40) + 35,
        lastActivity: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        schedule: this.generateWeeklySchedule(member.shift_c)
      };
    } catch (error) {
      console.error(`Error fetching staff member ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(staff) {
    await delay(300);
    try {
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          name_c: staff.name,
          email_c: staff.email,
          phone_c: staff.phone,
          role_c: staff.role,
          shift_c: staff.shift,
          status_c: staff.status || 'Active',
          hireDate_c: staff.hireDate || new Date().toISOString().split('T')[0]
        }]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} staff records:`, failed);
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            name: created.name_c,
            email: created.email_c,
            phone: created.phone_c,
            role: created.role_c,
            shift: created.shift_c,
            status: created.status_c,
            hireDate: created.hireDate_c,
            department: this.getDepartmentFromRole(created.role_c),
            hoursWorked: 0,
            weeklyHours: 0,
            lastActivity: new Date().toISOString(),
            schedule: this.generateWeeklySchedule(created.shift_c)
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating staff member:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, staffData) {
    await delay(300);
    try {
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Id: id,
          name_c: staffData.name,
          email_c: staffData.email,
          phone_c: staffData.phone,
          role_c: staffData.role,
          shift_c: staffData.shift,
          status_c: staffData.status,
          hireDate_c: staffData.hireDate
        }]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} staff records:`, failed);
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            name: updated.name_c,
            email: updated.email_c,
            phone: updated.phone_c,
            role: updated.role_c,
            shift: updated.shift_c,
            status: updated.status_c,
            hireDate: updated.hireDate_c,
            department: this.getDepartmentFromRole(updated.role_c),
            hoursWorked: staffData.hoursWorked || 0,
            weeklyHours: staffData.weeklyHours || 0,
            lastActivity: new Date().toISOString(),
            schedule: this.generateWeeklySchedule(updated.shift_c)
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating staff member:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    await delay(300);
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} staff records:`, failed);
        }

        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting staff member:", error?.response?.data?.message || error);
      return false;
    }
  }

  getDepartmentFromRole(role) {
    const departments = {
      'Front Desk': 'Front Office',
      'Receptionist': 'Front Office',
      'Concierge': 'Front Office',
      'Housekeeping': 'Housekeeping',
      'Room Attendant': 'Housekeeping',
      'Housekeeper': 'Housekeeping',
      'Maintenance': 'Maintenance',
      'Engineer': 'Maintenance',
      'Technician': 'Maintenance',
      'Manager': 'Management',
      'Supervisor': 'Management',
      'Chef': 'Food & Beverage',
      'Cook': 'Food & Beverage',
      'Server': 'Food & Beverage',
      'Bartender': 'Food & Beverage'
    };
    return departments[role] || 'General';
  }

  generateWeeklySchedule(shift) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shiftTimes = {
      'Morning': { start: '07:00', end: '15:00' },
      'Afternoon': { start: '15:00', end: '23:00' },
      'Night': { start: '23:00', end: '07:00' },
      'Day': { start: '09:00', end: '17:00' }
    };

    const times = shiftTimes[shift] || shiftTimes['Day'];
    
    return days.map((day, index) => ({
      day,
      isWorkday: index < 5,
      startTime: index < 5 ? times.start : null,
      endTime: index < 5 ? times.end : null,
      hours: index < 5 ? 8 : 0
}));
  }
}

export const staffService = new StaffService();