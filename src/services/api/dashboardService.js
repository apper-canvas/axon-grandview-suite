import { getApperClient } from '@/services/apperClient';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate realistic fluctuations for real-time data
const generateFluctuation = (baseValue, percentage = 0.1) => {
  const fluctuation = (Math.random() - 0.5) * 2 * percentage;
  return Math.max(0, baseValue * (1 + fluctuation));
};

export const dashboardService = {
  // Get all KPI metrics with real-time updates
async getKPIMetrics() {
    await delay(300);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available for KPI metrics fetch');
        return [];
      }

      const response = await apperClient.fetchRecords('kpi_metric_c', {
        fields: [
          {"field": {"Name": "label_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "unit_c"}},
          {"field": {"Name": "trend_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "color_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "ASC"}]
      });

      if (!response?.success || !response?.data) {
        console.error('Failed to fetch KPI metrics:', response?.message || 'Unknown error');
        return [];
      }

      return response.data.map(metric => ({
        label: metric.label_c || 'Unknown',
        value: metric.value_c || 0,
        unit: metric.unit_c || '',
        trend: metric.trend_c || 0,
        icon: metric.icon_c || 'TrendingUp',
        color: metric.color_c || 'primary',
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching KPI metrics:', error?.message || error);
      return [];
    }
  },

  // Get recent activities
async getActivities() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.fetchRecords('activity_c', {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "type_c" } },
          { field: { Name: "message_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "user_c" } },
          { field: { Name: "details_c" } }
        ],
        orderBy: [{ fieldName: "timestamp_c", sorttype: "DESC" }]
      });

      if (!response.success) {
        console.error('Failed to fetch activities:', response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching activities:', error?.message || error);
      return [];
    }
  },

  // Get notifications
async getNotifications() {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.fetchRecords('notification_c', {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "message_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "read_c" } }
        ],
        orderBy: [{ fieldName: "timestamp_c", sorttype: "DESC" }],
        pagingInfo: { limit: 50, offset: 0 }
      });
      
      if (!response.success || !response.data) {
        console.error("Error fetching notifications:", response.message);
        return [];
      }
      
      // Map database fields to expected format
      return response.data.map(notification => ({
        Id: notification.Id,
        message: notification.message_c,
        type: notification.type_c,
        timestamp: notification.timestamp_c,
        read: notification.read_c
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error?.message || error);
      return [];
    }
  },

// Get chart data for revenue
  async getChartData() {
    try {
      const apperClient = getApperClient();
      
      // Fetch data for different periods in parallel
      const [dailyResponse, weeklyResponse, monthlyResponse] = await Promise.all([
        apperClient.fetchRecords('chart_data_c', {
          fields: [
            { field: { Name: "label_c" } },
            { field: { Name: "value_c" } },
            { field: { Name: "date_c" } }
          ],
          where: [{ FieldName: "period_c", Operator: "EqualTo", Values: ["daily"] }],
          orderBy: [{ fieldName: "date_c", sorttype: "ASC" }],
          pagingInfo: { limit: 30, offset: 0 }
        }),
        apperClient.fetchRecords('chart_data_c', {
          fields: [
            { field: { Name: "label_c" } },
            { field: { Name: "value_c" } },
            { field: { Name: "date_c" } }
          ],
          where: [{ FieldName: "period_c", Operator: "EqualTo", Values: ["weekly"] }],
          orderBy: [{ fieldName: "date_c", sorttype: "ASC" }],
          pagingInfo: { limit: 12, offset: 0 }
        }),
        apperClient.fetchRecords('chart_data_c', {
          fields: [
            { field: { Name: "label_c" } },
            { field: { Name: "value_c" } },
            { field: { Name: "date_c" } }
          ],
          where: [{ FieldName: "period_c", Operator: "EqualTo", Values: ["monthly"] }],
          orderBy: [{ fieldName: "date_c", sorttype: "ASC" }],
          pagingInfo: { limit: 12, offset: 0 }
        })
      ]);
      
      // Process daily data
      const dailyData = dailyResponse.success && dailyResponse.data
        ? dailyResponse.data.map(item => ({
            label: item.label_c,
            value: item.value_c,
            date: item.date_c
          }))
        : [];
      
      // Process weekly data
      const weeklyData = weeklyResponse.success && weeklyResponse.data
        ? weeklyResponse.data.map(item => ({
            label: item.label_c,
            value: item.value_c,
            date: item.date_c
          }))
        : [];
      
      // Process monthly data
      const monthlyData = monthlyResponse.success && monthlyResponse.data
        ? monthlyResponse.data.map(item => ({
            label: item.label_c,
            value: item.value_c,
            date: item.date_c
          }))
        : [];
      
      return {
        daily: {
          data: dailyData,
          total: dailyData.reduce((sum, item) => sum + item.value, 0)
        },
        weekly: {
          data: weeklyData,
          total: weeklyData.reduce((sum, item) => sum + item.value, 0)
        },
        monthly: {
          data: monthlyData,
          total: monthlyData.reduce((sum, item) => sum + item.value, 0)
        }
      };
    } catch (error) {
      console.error("Error fetching chart data:", error?.message || error);
      return {
        daily: { data: [], total: 0 },
        weekly: { data: [], total: 0 },
        monthly: { data: [], total: 0 }
      };
    }
  },

// Dismiss notification
  async dismissNotification(notificationId) {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.updateRecord('notification_c', {
        records: [{
          Id: notificationId,
          read_c: true
        }]
      });
      
      if (!response.success) {
        console.error("Error dismissing notification:", response.message);
        return { success: false, message: response.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error dismissing notification:", error?.message || error);
      return { success: false, message: error?.message || "Failed to dismiss notification" };
    }
  },

  // Get dashboard overview (combined data)
  async getDashboardOverview() {
    await delay(400);
    
    const [kpiMetrics, activities, notifications, chartData] = await Promise.all([
      this.getKPIMetrics(),
      this.getActivities(),
      this.getNotifications(),
      this.getChartData()
    ]);
    
// Get latest payment revenue for real-time updates
    let paymentRevenue = 0;
    try {
      const { default: paymentService } = await import('@/services/api/paymentService');
      const stats = await paymentService.getStats();
      paymentRevenue = stats.todaysRevenue || 0;
    } catch (error) {
      // Payment service not available, continue without payment data
    }

    return {
      kpiMetrics,
      activities: activities.slice(0, 10), // Only recent activities
      notifications: notifications.slice(0, 8), // Only recent notifications
      chartData,
      paymentRevenue, // Include payment revenue for dashboard integration
      lastUpdated: new Date().toISOString()
};
  },

  // Report aggregation methods
  async getReportData(metrics, dateRange, filters = {}) {
    await delay(600);
    
    const reportData = {};
    
    // Collect data based on requested metrics
    for (const metric of metrics) {
      switch (metric) {
        case 'total_revenue':
          try {
            const { default: paymentService } = await import('@/services/api/paymentService');
            const stats = await paymentService.getStats();
            reportData.totalRevenue = stats.totalRevenue;
          } catch (error) {
            reportData.totalRevenue = 0;
          }
          break;
          
        case 'occupancy_rate':
          try {
            const { roomService } = await import('@/services/api/roomService');
            const rooms = await roomService.getAll();
            const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
            reportData.occupancyRate = Math.round((occupiedRooms / rooms.length) * 100);
          } catch (error) {
            reportData.occupancyRate = 0;
          }
          break;
          
        case 'maintenance_requests':
          try {
            const { default: maintenanceService } = await import('@/services/api/maintenanceService');
            const stats = await maintenanceService.getMaintenanceStats();
            reportData.maintenanceRequests = stats.total;
          } catch (error) {
            reportData.maintenanceRequests = 0;
          }
          break;
          
        case 'staff_performance':
          try {
            const { default: staffService } = await import('@/services/api/staffService');
            const performance = await staffService.getStaffPerformance();
            reportData.staffPerformance = performance.reduce((sum, p) => sum + p.productivity, 0) / performance.length;
          } catch (error) {
            reportData.staffPerformance = 0;
          }
          break;
          
        default:
          reportData[metric] = Math.floor(Math.random() * 1000);
      }
    }
    
    return reportData;
  },

  async getDetailedReportData(metrics, dateRange, filters = {}) {
    await delay(800);
    
    const detailedData = [];
    
    // Generate sample detailed data based on metrics
    try {
      if (metrics.includes('bookings_detail')) {
        const { default: bookingService } = await import('@/services/api/bookingService');
        const bookings = await bookingService.getAll();
        detailedData.push(...bookings.map(b => ({
          type: 'Booking',
          id: b.Id,
          guest: b.guestName,
          room: b.roomNumber,
          amount: b.totalAmount,
          status: b.status,
          date: b.checkInDate
        })));
      }
      
      if (metrics.includes('payments_detail')) {
        const { default: paymentService } = await import('@/services/api/paymentService');
        const payments = await paymentService.getAll();
        detailedData.push(...payments.map(p => ({
          type: 'Payment',
          id: p.Id,
          amount: p.amount,
          method: p.method,
          status: p.status,
          date: p.processedAt
        })));
      }
    } catch (error) {
      console.error('Error collecting detailed report data:', error);
    }
    
    return detailedData;
  }
};