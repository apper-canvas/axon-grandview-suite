const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
});

const getAll = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "amount_c" } },
        { field: { Name: "payment_method_c" } },
        { field: { Name: "payment_status_c" } },
        { field: { Name: "transaction_id_c" } },
        { field: { Name: "payment_date_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "booking_id_c" } },
      ],
      orderBy: [{ fieldName: "Id", sorttype: "DESC" }],
    };

    const response = await apperClient.fetchRecords("payment_c", params);

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching payments:", error?.response?.data?.message || error);
    return [];
  }
};

const getById = async (id) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "amount_c" } },
        { field: { Name: "payment_method_c" } },
        { field: { Name: "payment_status_c" } },
        { field: { Name: "transaction_id_c" } },
        { field: { Name: "payment_date_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "booking_id_c" } },
      ],
    };

    const response = await apperClient.getRecordById("payment_c", id, params);

    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data || null;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

const create = async (paymentData) => {
  try {
    const params = {
      records: [
        {
          amount_c: paymentData.amount_c,
          payment_method_c: paymentData.payment_method_c,
          payment_status_c: paymentData.payment_status_c,
          transaction_id_c: paymentData.transaction_id_c,
          payment_date_c: paymentData.payment_date_c,
          notes_c: paymentData.notes_c || "",
          booking_id_c: paymentData.booking_id_c ? parseInt(paymentData.booking_id_c) : null,
        },
      ],
    };

    const response = await apperClient.createRecord("payment_c", params);

    if (!response.success) {
      console.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter((r) => r.success);
      const failed = response.results.filter((r) => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to create payment:`, failed);
        return null;
      }

      return successful[0]?.data || null;
    }

    return null;
  } catch (error) {
    console.error("Error creating payment:", error?.response?.data?.message || error);
    return null;
  }
};

const update = async (id, paymentData) => {
  try {
    const params = {
      records: [
        {
          Id: parseInt(id),
          amount_c: paymentData.amount_c,
          payment_method_c: paymentData.payment_method_c,
          payment_status_c: paymentData.payment_status_c,
          transaction_id_c: paymentData.transaction_id_c,
          payment_date_c: paymentData.payment_date_c,
          notes_c: paymentData.notes_c || "",
          booking_id_c: paymentData.booking_id_c ? parseInt(paymentData.booking_id_c) : null,
        },
      ],
    };

    const response = await apperClient.updateRecord("payment_c", params);

    if (!response.success) {
      console.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter((r) => r.success);
      const failed = response.results.filter((r) => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update payment ${id}:`, failed);
        return null;
      }

      return successful[0]?.data || null;
    }

    return null;
  } catch (error) {
    console.error(`Error updating payment ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

const deletePayment = async (id) => {
  try {
    const params = {
      RecordIds: [parseInt(id)],
    };

    const response = await apperClient.deleteRecord("payment_c", params);

    if (!response.success) {
      console.error(response.message);
      return false;
    }

    if (response.results) {
      const failed = response.results.filter((r) => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to delete payment ${id}:`, failed);
        return false;
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error deleting payment ${id}:`, error?.response?.data?.message || error);
    return false;
  }
};

const getUnpaidBookings = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "guest_name_c" } },
        { field: { Name: "total_amount_c" } },
      ],
      where: [
        {
          FieldName: "payment_status_c",
          Operator: "EqualTo",
          Values: ["Unpaid"],
        },
      ],
    };

    const response = await apperClient.fetchRecords("booking_c", params);

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching unpaid bookings:", error?.response?.data?.message || error);
    return [];
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deletePayment,
  getUnpaidBookings,
};