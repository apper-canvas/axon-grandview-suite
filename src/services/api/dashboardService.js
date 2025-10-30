import kpiMetricsData from "@/services/mockData/kpiMetrics.json";
import notificationsData from "@/services/mockData/notifications.json";
import chartDataJson from "@/services/mockData/chartData.json";

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
    
    return kpiMetricsData.map(metric => ({
      ...metric,
      value: metric.unit === "%" || metric.unit === "rating" 
        ? parseFloat(generateFluctuation(metric.value, 0.05).toFixed(1))
        : Math.round(generateFluctuation(metric.value, 0.08)),
      lastUpdated: new Date().toISOString()
    }));
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
    await delay(250);
    
    // Sort by timestamp descending and return copy
    return [...notificationsData].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Get chart data for revenue
  async getChartData() {
    await delay(350);
    
    // Add slight variations to make it feel more real-time
    const updatedChartData = { ...chartDataJson };
    
    // Update the last data point in daily chart with slight variation
    const dailyData = [...updatedChartData.daily.data];
    const lastDayIndex = dailyData.length - 1;
    dailyData[lastDayIndex] = {
      ...dailyData[lastDayIndex],
      value: Math.round(generateFluctuation(dailyData[lastDayIndex].value, 0.05))
    };
    
    updatedChartData.daily = {
      ...updatedChartData.daily,
      data: dailyData,
      total: dailyData.reduce((sum, item) => sum + item.value, 0)
    };
    
    return updatedChartData;
  },

  // Dismiss notification
  async dismissNotification(notificationId) {
    await delay(150);
    
    const notification = notificationsData.find(n => n.Id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    return { success: true };
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