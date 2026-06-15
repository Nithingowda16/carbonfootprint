const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('ecotrack_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers,
    };
    
    if (options.body) {
        config.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if PDF download
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
        return response.blob();
    }
    
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = { error: 'Failed to parse JSON response' };
    }
    
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
}

export const api = {
    // Auth
    login: async (login_id, password) => {
        const data = await request('/auth/login', {
            method: 'POST',
            body: { login_id, password }
        });
        localStorage.setItem('ecotrack_token', data.access_token);
        return data;
    },
    
    register: async (username, email, password) => {
        const data = await request('/auth/register', {
            method: 'POST',
            body: { username, email, password }
        });
        localStorage.setItem('ecotrack_token', data.access_token);
        return data;
    },
    
    logout: () => {
        localStorage.removeItem('ecotrack_token');
    },
    
    getProfile: () => request('/auth/profile'),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, new_password) => request('/auth/reset-password', { method: 'POST', body: { token, new_password } }),
    getGamification: () => request('/auth/gamification'),
    
    // Calculator & Logs
    addRecord: (date, details) => request('/calculator/record', { method: 'POST', body: { date, details } }),
    getHistory: () => request('/calculator/history'),
    getSummary: () => request('/calculator/summary'),
    
    // Goals
    createGoal: (category, target_reduction_pct, frequency) => 
        request('/calculator/goals', { method: 'POST', body: { category, target_reduction_pct, frequency } }),
    getGoals: () => request('/calculator/goals'),
    
    // Actions
    logAction: (action_key, action_type, carbon_reduction, money_saved, difficulty) => 
        request('/calculator/actions', { method: 'POST', body: { action_key, action_type, carbon_reduction, money_saved, difficulty } }),
    getActions: () => request('/calculator/actions'),
    
    // Challenges
    listChallenges: () => request('/calculator/challenges'),
    joinChallenge: (challengeId) => request('/calculator/challenges/join/' + challengeId, { method: 'POST' }),
    logChallengeProgress: (challengeId, progress) => 
        request('/calculator/challenges/progress/' + challengeId, { method: 'POST', body: { progress } }),
    getJoinedChallenges: () => request('/calculator/challenges/joined'),
    
    // Recommendations
    getRecommendations: () => request('/recommendations/'),
    
    // Chatbot
    postChatMessage: (message) => request('/chatbot/', { method: 'POST', body: { message } }),
    getChatHistory: () => request('/chatbot/history'),
    
    // Reports
    downloadReport: async () => {
        const blob = await request('/reports/download');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecotrack_report_${new Date().toISOString().slice(0,10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }
};
