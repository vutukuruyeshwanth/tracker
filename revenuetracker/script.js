// Global variables to store revenue data and chart instances
        let revenueData = [];
        let activityChart, distributionChart;

        // Revenue sharing percentages for each activity type
        const revenueShares = {
            'homestay': { individual: 60, community: 40 },
            'guided-tour': { individual: 70, community: 30 },
            'food': { individual: 65, community: 35 },
            'handicraft': { individual: 80, community: 20 }
        };

        // User-friendly labels for activities
        const activityLabels = {
            'homestay': 'Homestay',
            'guided-tour': 'Guided Tour',
            'food': 'Local Cuisine',
            'handicraft': 'Handicrafts'
        };

        /**
         * Shows a custom modal alert message.
         * @param {string} title - The title of the alert.
         * @param {string} message - The message to display.
         */
        function showAlert(title, message) {
            document.getElementById('alert-title').textContent = title;
            document.getElementById('alert-message').textContent = message;
            document.getElementById('alert-modal').classList.remove('hidden');
        }

        /**
         * Closes the custom modal alert message.
         */
        function closeAlert() {
            document.getElementById('alert-modal').classList.add('hidden');
        }

        /**
         * Navigates to the specified section of the page.
         * @param {string} sectionId - The ID of the section to show.
         */
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(sectionId).classList.remove('hidden');

            if (sectionId === 'tracker') {
                initCharts();
                updateDashboard();
                updateTransactionTable();
                updateCharts();
            }
        }

        /**
         * Adds a new revenue entry based on user input from the form.
         */
        function addRevenue() {
            const activityType = document.getElementById('activityType').value;
            const amount = parseFloat(document.getElementById('revenueAmount').value);
            const beneficiary = document.getElementById('beneficiary').value.trim();

            if (isNaN(amount) || amount <= 0) {
                showAlert('Invalid Input', 'Please enter a valid amount.');
                return;
            }
            if (!beneficiary) {
                showAlert('Invalid Input', 'Please enter the beneficiary name.');
                return;
            }

            const shares = revenueShares[activityType];
            const individualShare = (amount * shares.individual) / 100;
            const communityShare = (amount * shares.community) / 100;

            const transaction = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                activityType,
                amount,
                beneficiary,
                individualShare,
                communityShare
            };

            revenueData.push(transaction);
            saveData();

            updateDashboard();
            updateTransactionTable();
            updateCharts();

            // Clear the form fields
            document.getElementById('revenueAmount').value = '';
            document.getElementById('beneficiary').value = '';
        }

        /**
         * Calculates and updates the dashboard metrics.
         */
        function updateDashboard() {
            const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
            const totalCommunityFund = revenueData.reduce((sum, item) => sum + item.communityShare, 0);
            const totalIndividualEarnings = revenueData.reduce((sum, item) => sum + item.individualShare, 0);

            document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
            document.getElementById('communityFund').textContent = `₹${totalCommunityFund.toLocaleString()}`;
            document.getElementById('individualEarnings').textContent = `₹${totalIndividualEarnings.toLocaleString()}`;
        }

        /**
         * Renders the last 10 transactions in the table.
         */
        function updateTransactionTable() {
            const tableBody = document.getElementById('transactionTable');
            
            if (revenueData.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">No transactions yet. Add your first revenue entry above!</td></tr>';
                return;
            }

            const recentTransactions = [...revenueData].reverse().slice(0, 10);
            tableBody.innerHTML = recentTransactions.map(transaction => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 px-4">${transaction.date}</td>
                    <td class="py-3 px-4">${activityLabels[transaction.activityType]}</td>
                    <td class="py-3 px-4 font-semibold">₹${transaction.amount.toLocaleString()}</td>
                    <td class="py-3 px-4">${transaction.beneficiary}</td>
                    <td class="py-3 px-4 text-green-600">₹${transaction.individualShare.toLocaleString()}</td>
                    <td class="py-3 px-4 text-blue-600">₹${transaction.communityShare.toLocaleString()}</td>
                </tr>
            `).join('');
        }

        /**
         * Initializes the Chart.js instances for the first time.
         */
        function initCharts() {
            if (activityChart) activityChart.destroy();
            if (distributionChart) distributionChart.destroy();

            const activityCtx = document.getElementById('activityChart').getContext('2d');
            activityChart = new Chart(activityCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

            const distributionCtx = document.getElementById('distributionChart').getContext('2d');
            distributionChart = new Chart(distributionCtx, {
                type: 'bar',
                data: {
                    labels: ['Individual Earnings', 'Community Fund'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#4c1d95', '#1d4ed8'],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) { return '₹' + value.toLocaleString(); }
                            }
                        }
                    }
                }
            });
        }

        /**
         * Updates the chart data and redraws them.
         */
        function updateCharts() {
            if (!activityChart || !distributionChart) return;
            
            const activityTotals = {};
            revenueData.forEach(item => {
                activityTotals[item.activityType] = (activityTotals[item.activityType] || 0) + item.amount;
            });

            activityChart.data.labels = Object.keys(activityTotals).map(key => activityLabels[key]);
            activityChart.data.datasets[0].data = Object.values(activityTotals);
            activityChart.update();

            const totalIndividual = revenueData.reduce((sum, item) => sum + item.individualShare, 0);
            const totalCommunity = revenueData.reduce((sum, item) => sum + item.communityShare, 0);

            distributionChart.data.datasets[0].data = [totalIndividual, totalCommunity];
            distributionChart.update();
        }

        /**
         * Saves the current revenue data to localStorage.
         */
        function saveData() {
            try {
                localStorage.setItem('revenueData', JSON.stringify(revenueData));
            } catch (error) {
                console.error('Failed to save data to local storage:', error);
            }
        }

        /**
         * Loads revenue data from localStorage on page load.
         */
        function loadData() {
            try {
                const storedData = localStorage.getItem('revenueData');
                if (storedData) {
                    revenueData = JSON.parse(storedData);
                }
            } catch (error) {
                console.error('Failed to load data from local storage:', error);
            }
        }

        window.onload = function() {
            loadData();
            showSection('home');
        };
