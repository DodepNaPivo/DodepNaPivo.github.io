const Requests = {
    getAll: () => {
        const requests = localStorage.getItem('requests');
        return requests ? JSON.parse(requests) : [];
    },
    
    saveAll: (requests) => {
        localStorage.setItem('requests', JSON.stringify(requests));
    },
    
    add: async (requestData) => {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) {
            throw new Error('Пользователь не авторизован');
        }
        
        let userId = parseInt(currentUser.id);
        
        if (!userId || isNaN(userId)) {
            try {
                const userResponse = await fetch('http://localhost/api/get_user_by_email.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: currentUser.email })
                });
                
                const userData = await userResponse.json();
                if (userData.success && userData.user) {
                    userId = parseInt(userData.user.id);
                    const updatedUser = {
                        ...currentUser,
                        id: userData.user.id.toString()
                    };
                    Storage.setCurrentUser(updatedUser);
                } else {
                    throw new Error('Пользователь не найден в базе данных. Пожалуйста, войдите заново.');
                }
            } catch (error) {
                throw new Error('Не удалось синхронизировать данные пользователя. Пожалуйста, войдите заново.');
            }
        }
        
        const apiUrl = 'http://localhost/api/create_request.php';
        
        const requestPayload = {
            user_id: userId,
            tariff_name: requestData.tariffName || requestData.tariff_name,
            tariff_price: parseFloat(requestData.tariffPrice || requestData.tariff_price)
        };
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });
            
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Сервер вернул невалидный JSON: ' + responseText);
            }
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            if (data.success) {
                const requests = Requests.getAll();
                const newRequest = {
                    id: data.request_id.toString(),
                    ...requestData,
                    userId: userId.toString()
                };
                requests.push(newRequest);
                Requests.saveAll(requests);
                return data.request_id;
            } else {
                throw new Error(data.error || 'Не удалось создать заявку');
            }
        } catch (error) {
            throw error;
        }
    },
    
    updateStatus: async (requestId, status) => {
        const apiUrl = 'http://localhost/api/update_request_status.php';
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: parseInt(requestId),
                    status: status
                })
            });
            
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Сервер вернул невалидный JSON: ' + responseText);
            }
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            if (data.success) {
                const requests = Requests.getAll();
                const request = requests.find(r => r.id === requestId);
                if (request) {
                    request.status = status;
                    request.updatedAt = new Date().toISOString();
                    Requests.saveAll(requests);
                }
                return true;
            } else {
                throw new Error(data.error || 'Не удалось обновить статус');
            }
        } catch (error) {
            const requests = Requests.getAll();
            const request = requests.find(r => r.id === requestId);
            if (request) {
                request.status = status;
                request.updatedAt = new Date().toISOString();
                Requests.saveAll(requests);
            }
            throw error;
        }
    },
    
    delete: (requestId) => {
        const requests = Requests.getAll();
        const filtered = requests.filter(r => r.id !== requestId);
        Requests.saveAll(filtered);
    }
};
