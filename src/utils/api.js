const API_BASE = 'http://10.255.22.153:5000/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  const text = await response.text()

  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message = data?.error || response.statusText || 'Request failed'
    throw new ApiError(message, response.status)
  }

  return data
}

export const auth = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
}

export const user = {
  getProfile: () => apiRequest('/user/profile'),
  updateProfile: (profileData) => apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
}

export const workouts = {
  getAll: (category = 'all') => apiRequest(`/workouts?category=${category}`),
  getById: (id) => apiRequest(`/workouts/${id}`),
  create: (workoutData) => apiRequest('/workouts', {
    method: 'POST',
    body: JSON.stringify(workoutData),
  }),
  savePlan: (planData) => apiRequest('/plans', {
    method: 'POST',
    body: JSON.stringify(planData),
  }),
  getPlans: () => apiRequest('/plans'),
  deletePlan: async (planId) => {
    if (!planId) throw new Error('Plan ID is required')

    try {
      return await apiRequest(`/plans/${planId}`, {
        method: 'DELETE',
      })
    } catch (err) {
      if (err.status === 404) {
        return await apiRequest('/plans', {
          method: 'DELETE',
          body: JSON.stringify({ planId }),
        })
      }
      throw err
    }
  },
}

export const sessions = {
  create: (sessionData) => apiRequest('/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),
  getRecent: () => apiRequest('/sessions'),
}

export const progress = {
  update: (progressData) => apiRequest('/progress', {
    method: 'POST',
    body: JSON.stringify(progressData),
  }),
  get: (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return apiRequest(`/progress?${params}`)
  },
}

export const achievements = {
  get: () => apiRequest('/achievements'),
  unlock: (achievementType) => apiRequest('/achievements', {
    method: 'POST',
    body: JSON.stringify({ achievementType }),
  }),
}

export const dashboard = {
  getData: () => apiRequest('/dashboard'),
}

export default {
  auth,
  user,
  workouts,
  sessions,
  progress,
  achievements,
  dashboard,
}