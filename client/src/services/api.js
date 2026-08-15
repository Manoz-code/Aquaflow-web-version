const API_URL = "http://localhost:3000/api";

// =========================
// LOGIN
// =========================

export const loginUser = async (phone, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// =========================
// GENERAL API REQUEST
// =========================

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// =========================
// CUSTOMERS
// =========================

export const getCustomers = async () => {
  return apiRequest("/customers");
};

export const createCustomer = async (
  name,
  phone,
  address
) => {
  return apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify({
      name,
      phone,
      address,
    }),
  });
};

export const getCustomerById = async (id) => {
  return apiRequest(`/customers/${id}`);
};

export const getCustomerSummary = async (id) => {
  return apiRequest(`/customers/${id}/summary`);
};

export const deleteCustomer = async (id) => {
  return apiRequest(`/customers/${id}`, {
    method: "DELETE",
  });
};

// =========================
// DELIVERIES
// =========================

export const getDeliveries = async () => {
  return apiRequest("/deliveries");
};

export const createDelivery = async ({
  customer_id,
  driver_id,
  quantity_liters,
  price_per_liter,
  extra_charge,
  total_amount,
  delivery_status = "pending",
  notes = "",
}) => {
  return apiRequest("/deliveries", {
    method: "POST",
    body: JSON.stringify({
      customer_id,
      driver_id,
      quantity_liters,
      price_per_liter,
      extra_charge,
      total_amount,
      delivery_status,
      notes,
    }),
  });
};

export const updateDeliveryStatus = async (
  id,
  delivery_status
) => {
  return apiRequest(`/deliveries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      delivery_status,
    }),
  });
};

// DELETE DELIVERY
export const deleteDelivery = async (id) => {
  return apiRequest(`/deliveries/${id}`, {
    method: "DELETE",
  });
};


// =========================
// DRIVERS
// =========================

export const getDrivers = async () => {
  return apiRequest("/drivers");
};

export const getDriverById = async (id) => {
  return apiRequest(`/drivers/${id}`);
};

export const createDriver = async (user_id) => {
  return apiRequest("/drivers", {
    method: "POST",
    body: JSON.stringify({
      user_id,
    }),
  });
};

export const updateDriver = async (
  id,
  user_id
) => {
  return apiRequest(`/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      user_id,
    }),
  });
};

export const deactivateDriver = async (id) => {
  return apiRequest(`/drivers/${id}/deactivate`, {
    method: "PATCH",
  });
};

export const reactivateDriver = async (id) => {
  return apiRequest(`/drivers/${id}/reactivate`, {
    method: "PATCH",
  });
};



// =========================
// PROFILE
// =========================

export const getProfile = async (token) => {
  const response = await fetch(
    `${API_URL}/auth/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch profile"
    );
  }

  return data;
};

export const updateProfile = async (
  token,
  name
) => {
  const response = await fetch(
    `${API_URL}/auth/profile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update profile"
    );
  }

  return data;
};

export const changePassword = async (
  token,
  currentPassword,
  newPassword
) => {
  const response = await fetch(
    `${API_URL}/auth/change-password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to change password"
    );
  }

  return data;
};

export const uploadProfileImage = async (
  token,
  file
) => {
  const formData = new FormData();

  formData.append(
    "profile_image",
    file
  );

  const response = await fetch(
    `${API_URL}/auth/profile/image`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to upload profile image"
    );
  }

  return data;
};

// =========================
// USERS
// =========================

export const getUsers = async () => {
  return apiRequest("/admin/users");
};

export const updateUserStatus = async (
  id,
  status
) => {
  return apiRequest(
    `/admin/users/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
};

export const registerStaff = async (
  name,
  phone,
  password
) => {
  return apiRequest(
    "/auth/register-staff",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        phone,
        password,
      }),
    }
  );
};

export const deleteUser = async (id) => {
  return apiRequest(
    `/admin/users/${id}`,
    {
      method: "DELETE",
    }
  );
};

// =========================
// PAYMENTS
// =========================

export const getPayments = async () => {
  return apiRequest("/payments");
};

export const createPayment = async (
  customer_id,
  delivery_id,
  amount,
  payment_method,
  notes = ""
) => {
  return apiRequest("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer_id,
      delivery_id,
      amount,
      payment_method,
      notes,
    }),
  });
};

export const getPaymentDeliveries = async () => {
  return apiRequest(
    "/payments/deliveries"
  );
};

// =========================
// REPORT SUMMARY
// =========================

export const getReportSummary = async (
  from = "",
  to = ""
) => {
  let endpoint = "/reports/summary";

  const params = new URLSearchParams();

  if (from) {
    params.append("from", from);
  }

  if (to) {
    params.append("to", to);
  }

  const queryString = params.toString();

  if (queryString) {
    endpoint += `?${queryString}`;
  }

  return apiRequest(endpoint);
};


// =========================
// SECURITY ALERTS
// =========================

export const getSecurityAlerts = async () => {
  return apiRequest("/security-alerts");
};


// Get unread notification count

export const getUnreadSecurityAlertCount =
  async () => {
    return apiRequest(
      "/security-alerts/unread-count"
    );
  };


// Mark one alert as read

export const markSecurityAlertAsRead =
  async (id) => {
    return apiRequest(
      `/security-alerts/${id}/read`,
      {
        method: "PATCH",
      }
    );
  };


// Mark all alerts as read

export const markAllSecurityAlertsAsRead =
  async () => {
    return apiRequest(
      "/security-alerts/read-all",
      {
        method: "PATCH",
      }
    );
  };